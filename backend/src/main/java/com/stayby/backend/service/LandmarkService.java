package com.stayby.backend.service;

import com.stayby.backend.dto.LandmarkResponse;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.PropertyLandmark;
import com.stayby.backend.repository.PropertyLandmarkRepository;
import com.stayby.backend.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Finds important places (hospitals, universities, beaches...) near a
 * property using free OpenStreetMap data (Overpass API) and stores them.
 */
@Service
public class LandmarkService {

    private static final Logger log =
            LoggerFactory.getLogger(LandmarkService.class);

    private static final String[] OVERPASS_ENDPOINTS = {
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"
    };

    private static final String SEPARATOR = "|";

    // How many places of each kind we keep (nearest first).
    private static final Map<String, Integer> BUCKET_LIMITS = Map.of(
            "Hospital", 3,
            "Education", 3,
            "Beach", 3,
            "Tourist place", 4,
            "Transport", 2);

    private final PropertyRepository propertyRepository;
    private final PropertyLandmarkRepository landmarkRepository;

    // Own thread pool so lookups never block other background work.
    private final ExecutorService pool = Executors.newFixedThreadPool(6);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public LandmarkService(
            PropertyRepository propertyRepository,
            PropertyLandmarkRepository landmarkRepository) {
        this.propertyRepository = propertyRepository;
        this.landmarkRepository = landmarkRepository;
    }

    /* =====================================================
       READ
    ===================================================== */

    public List<LandmarkResponse> getLandmarks(Long propertyId) {
        return landmarkRepository.findByPropertyIdSorted(propertyId)
                .stream()
                .map(LandmarkResponse::fromEntity)
                .toList();
    }

    /** Landmarks for many properties at once (used by search). */
    public Map<Long, List<LandmarkResponse>> getLandmarksByProperty(
            Collection<Long> propertyIds) {

        Map<Long, List<LandmarkResponse>> result = new HashMap<>();

        if (propertyIds == null || propertyIds.isEmpty()) {
            return result;
        }

        for (PropertyLandmark landmark
                : landmarkRepository.findByPropertyIds(propertyIds)) {

            result.computeIfAbsent(
                    landmark.getProperty().getId(),
                    key -> new ArrayList<>())
                    .add(LandmarkResponse.fromEntity(landmark));
        }

        return result;
    }

    public List<String> suggest(String query) {

        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        return landmarkRepository.suggestNames(
                query.trim(),
                PageRequest.of(0, 8));
    }

    /* =====================================================
       SEARCH MATCHING
    ===================================================== */

    /**
     * A landmark matches when EVERY word typed by the traveler appears in
     * its name or category. "asiri hospital" matches "Asiri Central
     * Hospital"; "beach" matches every landmark in the Beach category.
     */
    public static boolean matches(String query, LandmarkResponse landmark) {

        if (query == null || query.isBlank() || landmark == null) {
            return false;
        }

        String haystack = (
                (landmark.getName() == null ? "" : landmark.getName())
                        + " "
                        + (landmark.getCategory() == null
                                ? ""
                                : landmark.getCategory()))
                .toLowerCase(Locale.ROOT);

        for (String token : query.toLowerCase(Locale.ROOT)
                .split("[^\\p{L}\\p{N}]+")) {

            if (!token.isEmpty() && !haystack.contains(token)) {
                return false;
            }
        }

        return true;
    }

    /* =====================================================
       OWNER ACTIONS
    ===================================================== */

    public List<LandmarkResponse> refreshForOwner(
            Long propertyId,
            Long userId,
            boolean isAdmin) {

        Property property = loadOwnedProperty(propertyId, userId, isAdmin);

        refreshLandmarks(property.getId());

        return getLandmarks(propertyId);
    }

    public void deleteLandmark(
            Long propertyId,
            Long landmarkId,
            Long userId,
            boolean isAdmin) {

        loadOwnedProperty(propertyId, userId, isAdmin);

        PropertyLandmark landmark = landmarkRepository.findById(landmarkId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Landmark not found"));

        if (!landmark.getProperty().getId().equals(propertyId)) {
            throw new IllegalArgumentException("Landmark not found");
        }

        landmarkRepository.delete(landmark);
    }

    private Property loadOwnedProperty(
            Long propertyId,
            Long userId,
            boolean isAdmin) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Property not found"));

        if (!isAdmin
                && !property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to modify this property");
        }

        return property;
    }

    /* =====================================================
       REFRESH FROM OPENSTREETMAP
    ===================================================== */

    /**
     * Same as refreshLandmarks but never throws. Used right after a
     * property is saved so that a slow or unavailable map service can
     * never break saving a property.
     */
    public void refreshQuietly(Long propertyId) {
        try {
            refreshLandmarks(propertyId);
        } catch (Exception e) {
            log.warn("Could not refresh landmarks for property {}: {}",
                    propertyId, e.getMessage());
        }
    }

    /**
     * Looks up places around the property and replaces the stored list.
     * If the map service fails, the old list is kept.
     */
    public void refreshLandmarks(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Property not found"));

        if (property.getLatitude() == null
                || property.getLongitude() == null) {
            throw new IllegalArgumentException(
                    "Set the property location on the map first");
        }

        double lat = property.getLatitude();
        double lon = property.getLongitude();

        // Network call first; nothing is deleted if it fails.
        List<PropertyLandmark> found = fetchFromOverpass(property, lat, lon);

        landmarkRepository.deleteByPropertyId(propertyId);
        landmarkRepository.saveAll(found);
    }

    private List<PropertyLandmark> fetchFromOverpass(
            Property property,
            double lat,
            double lon) {

        String around = lat + "," + lon;

        // Small separate requests: lighter for the free map service, and
        // one slow category no longer makes the whole lookup fail.
        String[] filters = {
                "nwr(around:8000," + around
                        + ")[\"amenity\"=\"hospital\"][\"name\"];",
                "nwr(around:6000," + around
                        + ")[\"amenity\"=\"university\"][\"name\"];",
                "nwr(around:10000," + around
                        + ")[\"tourism\"~\"^(attraction|museum|zoo|theme_park)$\"][\"name\"];",
                "nwr(around:10000," + around
                        + ")[\"natural\"=\"beach\"][\"name\"];",
                "nwr(around:5000," + around
                        + ")[\"railway\"=\"station\"][\"name\"];"
        };

        // All six requests run at the same time.
        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (String filter : filters) {
            futures.add(CompletableFuture.supplyAsync(
                    () -> queryAnyEndpoint(buildQuery(filter)), pool));
        }

        StringBuilder csv = new StringBuilder();
        int succeeded = 0;
        String lastError = "no answer";

        for (CompletableFuture<String> future : futures) {
            try {
                String result = future.join();

                if (result != null) {
                    succeeded++;
                    csv.append(result).append('\n');
                }
            } catch (Exception e) {
                Throwable cause = e.getCause() != null ? e.getCause() : e;
                lastError = String.valueOf(cause.getMessage());
            }
        }

        if (succeeded == 0) {

            // The Overpass servers are overloaded: use Nominatim instead.
            String fallback = null;
            String fallbackError = "";

            try {
                fallback = fetchFromNominatim(lat, lon);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                fallbackError = " / Nominatim: " + e.getMessage();
            }

            if (fallback == null || fallback.isBlank()) {
                throw new IllegalStateException(
                        "The map service is busy right now. Please try again in a minute"
                                + " (" + lastError + fallbackError + ")");
            }

            return parse(property, lat, lon, fallback);
        }

        return parse(property, lat, lon, csv.toString());
    }

    /* =====================================================
       FALLBACK: Nominatim search (different servers)
    ===================================================== */

    // search word, then the same kind of rows Overpass would give us
    private static final String[] NOMINATIM_TERMS = {
            "hospital", "university", "beach",
            "museum", "attraction", "railway station"
    };

    private static final Pattern JSON_NAME =
            Pattern.compile("\"name\":\"((?:[^\"\\\\]|\\\\.)*)\"");
    private static final Pattern JSON_LAT =
            Pattern.compile("\"lat\":\"([^\"]+)\"");
    private static final Pattern JSON_LON =
            Pattern.compile("\"lon\":\"([^\"]+)\"");
    private static final Pattern JSON_TYPE =
            Pattern.compile("\"type\":\"([^\"]+)\"");

    /**
     * Returns rows in the same format as the Overpass CSV so the same
     * parser can be used:
     * lat|lon|name|name:en|amenity|tourism|natural|historic|railway|shop
     */
    private String fetchFromNominatim(double lat, double lon)
            throws IOException, InterruptedException {

        double delta = 0.09; // about 10 km

        String viewbox = (lon - delta) + "," + (lat + delta) + ","
                + (lon + delta) + "," + (lat - delta);

        StringBuilder rows = new StringBuilder();
        String lastError = null;
        int answered = 0;

        for (String term : NOMINATIM_TERMS) {

            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(
                                "https://nominatim.openstreetmap.org/search"
                                        + "?format=jsonv2&limit=10&bounded=1"
                                        + "&accept-language=en"
                                        + "&viewbox=" + viewbox
                                        + "&q=" + URLEncoder.encode(
                                                term, StandardCharsets.UTF_8)))
                        .timeout(Duration.ofSeconds(12))
                        .header("User-Agent", "StayBy/1.0 (student project)")
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString(
                                StandardCharsets.UTF_8));

                if (response.statusCode() != 200) {
                    lastError = "HTTP " + response.statusCode();
                } else {
                    answered++;
                    appendNominatimRows(rows, response.body());
                }

            } catch (IOException e) {
                lastError = e.getClass().getSimpleName()
                        + (e.getMessage() == null
                                ? ""
                                : ": " + e.getMessage());
            }

            // Nominatim's usage policy: at most one request per second.
            Thread.sleep(1100);
        }

        if (answered == 0) {
            throw new IOException(
                    lastError == null ? "no answer" : lastError);
        }

        return rows.toString();
    }

    private void appendNominatimRows(StringBuilder rows, String json) {

        for (String item : json.split("\\{\"place_id\"")) {

            Matcher nameMatcher = JSON_NAME.matcher(item);
            Matcher latMatcher = JSON_LAT.matcher(item);
            Matcher lonMatcher = JSON_LON.matcher(item);
            Matcher typeMatcher = JSON_TYPE.matcher(item);

            if (!nameMatcher.find() || !latMatcher.find()
                    || !lonMatcher.find() || !typeMatcher.find()) {
                continue;
            }

            String name = unescapeJson(nameMatcher.group(1))
                    .replace(SEPARATOR, " ").trim();

            if (name.isEmpty()) {
                continue;
            }

            String amenity = "";
            String tourism = "";
            String natural = "";
            String railway = "";
            String shop = "";

            switch (typeMatcher.group(1)) {
                case "hospital", "university" ->
                    amenity = typeMatcher.group(1);
                case "beach" -> natural = "beach";
                case "museum", "attraction", "zoo", "theme_park" ->
                    tourism = typeMatcher.group(1);
                case "station" -> railway = "station";
                default -> {
                    continue;
                }
            }

            rows.append(latMatcher.group(1)).append(SEPARATOR)
                    .append(lonMatcher.group(1)).append(SEPARATOR)
                    .append(name).append(SEPARATOR)
                    .append(SEPARATOR) // name:en (already English)
                    .append(amenity).append(SEPARATOR)
                    .append(tourism).append(SEPARATOR)
                    .append(natural).append(SEPARATOR)
                    .append(SEPARATOR) // historic
                    .append(railway).append(SEPARATOR)
                    .append(shop).append('\n');
        }
    }

    private static String unescapeJson(String value) {

        return value
                .replace("\\\"", "\"")
                .replace("\\/", "/")
                .replace("\\\\", "\\");
    }

    /** Tries each map server in turn; throws with the reasons if all fail. */
    private String queryAnyEndpoint(String query) {

        StringBuilder reasons = new StringBuilder();

        for (String endpoint : OVERPASS_ENDPOINTS) {
            try {
                return runQuery(endpoint, query);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("interrupted");
            } catch (IOException e) {
                String host = URI.create(endpoint).getHost();
                String reason = e.getClass().getSimpleName()
                        + (e.getMessage() == null
                                ? ""
                                : ": " + e.getMessage());

                log.warn("Landmark lookup failed on {}: {}", host, reason);

                reasons.append(host).append(" -> ")
                        .append(reason).append("; ");
            }
        }

        throw new IllegalStateException(reasons.toString());
    }

    private String runQuery(String endpoint, String query)
            throws IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", "StayBy/1.0 (student project)")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "data=" + URLEncoder.encode(
                                query, StandardCharsets.UTF_8)))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        if (response.statusCode() != 200) {
            String text = response.body() == null ? "" : response.body();

            throw new IOException(
                    "HTTP " + response.statusCode() + " "
                            + text.substring(0, Math.min(200, text.length()))
                                    .replaceAll("\\s+", " "));
        }

        return response.body();
    }

    private String buildQuery(String filter) {

        return "[out:csv(::lat,::lon,name,\"name:en\",amenity,tourism,"
                + "natural,historic,railway,shop;false;\"" + SEPARATOR + "\")]"
                + "[timeout:12];"
                + "(" + filter + ");"
                + "out center;";
    }

    private List<PropertyLandmark> parse(
            Property property,
            double lat,
            double lon,
            String csv) {

        // bucket -> (lower-case name -> landmark), keeps nearest duplicate
        Map<String, Map<String, PropertyLandmark>> buckets =
                new LinkedHashMap<>();

        for (String line : csv.split("\\R")) {

            if (line.isBlank()) {
                continue;
            }

            String[] c = line.split("\\" + SEPARATOR, -1);

            if (c.length < 10) {
                continue;
            }

            double placeLat;
            double placeLon;

            try {
                placeLat = Double.parseDouble(c[0].trim());
                placeLon = Double.parseDouble(c[1].trim());
            } catch (NumberFormatException e) {
                continue;
            }

            String name = !c[3].isBlank() ? c[3].trim() : c[2].trim();

            if (name.isEmpty()) {
                continue;
            }

            String amenity = c[4].trim();
            String tourism = c[5].trim();
            String natural = c[6].trim();
            String railway = c[8].trim();
            String shop = c[9].trim();

            String category;
            String bucket;

            if (amenity.equals("hospital")) {
                category = "Hospital";
                bucket = "Hospital";
            } else if (amenity.equals("university")
                    || amenity.equals("college")) {
                category = "Education";
                bucket = "Education";
            } else if (amenity.equals("school")) {
                category = "Education";
                bucket = "Education-school";
            } else if (natural.equals("beach")) {
                category = "Beach";
                bucket = "Beach";
            } else if (!tourism.isEmpty()) {
                category = "Tourist place";
                bucket = "Tourist place";
            } else if (railway.equals("station")
                    || amenity.equals("bus_station")) {
                category = "Transport";
                bucket = "Transport";
            } else if (amenity.equals("place_of_worship")) {
                category = "Religious";
                bucket = "Religious";
            } else if (shop.equals("mall")) {
                category = "Shopping";
                bucket = "Shopping";
            } else {
                continue;
            }

            double distance = Math.round(
                    distanceKm(lat, lon, placeLat, placeLon) * 10.0) / 10.0;

            Map<String, PropertyLandmark> bucketMap =
                    buckets.computeIfAbsent(
                            bucket, key -> new LinkedHashMap<>());

            String key = name.toLowerCase(Locale.ROOT);

            PropertyLandmark existing = bucketMap.get(key);

            if (existing == null || distance < existing.getDistanceKm()) {
                bucketMap.put(key, new PropertyLandmark(
                        property,
                        name.length() > 200 ? name.substring(0, 200) : name,
                        category,
                        placeLat,
                        placeLon,
                        distance));
            }
        }

        List<PropertyLandmark> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, PropertyLandmark>> entry
                : buckets.entrySet()) {

            int limit = BUCKET_LIMITS.getOrDefault(entry.getKey(), 3);

            result.addAll(entry.getValue().values().stream()
                    .sorted(Comparator.comparing(
                            PropertyLandmark::getDistanceKm))
                    .limit(limit)
                    .toList());
        }

        result.sort(Comparator.comparing(PropertyLandmark::getDistanceKm));

        return result;
    }

    /** Straight-line distance between two coordinates, in km. */
    public static double distanceKm(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        double earthRadiusKm = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return earthRadiusKm * 2
                * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}