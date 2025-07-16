import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:travel_buddy/models/place.dart';

class PlacesService {
  final String apiKey;

  PlacesService({required this.apiKey});

  Future<List<Place>> searchPlaces(String query) async {
    final response = await http.get(Uri.parse(
        'https://maps.googleapis.com/maps/api/place/textsearch/json?query=$query&key=$apiKey'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['status'] == 'OK') {
        final List<dynamic> results = data['results'];
        return results.map((e) => Place.fromJson(e, apiKey)).toList();
      } else {
        throw Exception('Failed to load places');
      }
    } else {
      throw Exception('Failed to load places');
    }
  }

  Future<Place> getPlaceDetails(String placeId) async {
    final response = await http.get(Uri.parse(
        'https://maps.googleapis.com/maps/api/place/details/json?place_id=$placeId&key=$apiKey'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['status'] == 'OK') {
        return Place.fromJson(data['result'], apiKey);
      } else {
        throw Exception('Failed to load place details');
      }
    } else {
      throw Exception('Failed to load place details');
    }
  }

  Future<List<Place>> getNearbyPlaces(
      {required double lat, required double lng, double radius = 5000}) async {
    final response = await http.get(Uri.parse(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=$lat,$lng&radius=$radius&key=$apiKey'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['status'] == 'OK') {
        final List<dynamic> results = data['results'];
        return results.map((e) => Place.fromJson(e, apiKey)).toList();
      } else {
        throw Exception('Failed to load nearby places');
      }
    } else {
      throw Exception('Failed to load nearby places');
    }
  }
}
