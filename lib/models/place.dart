class Place {
  final String id;
  final String name;
  final String address;
  final String type;
  final double rating;
  final String description;
  final String photoUrl;

  Place({
    required this.id,
    required this.name,
    required this.address,
    required this.type,
    required this.rating,
    required this.description,
    required this.photoUrl,
  });

  factory Place.fromJson(Map<String, dynamic> json, String apiKey) {
    return Place(
      id: json['place_id'],
      name: json['name'],
      address: json['formatted_address'] ?? json['vicinity'] ?? '',
      type: json['types'] != null && json['types'].isNotEmpty ? json['types'][0] : '',
      rating: json['rating']?.toDouble() ?? 0.0,
      description: 'A great place to visit.',
      photoUrl: json['photos'] != null && json['photos'].isNotEmpty
          ? 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${json['photos'][0]['photo_reference']}&key=$apiKey'
          : 'https://picsum.photos/300/200',
    );
  }
}
