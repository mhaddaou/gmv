export class PlacesQueryDto {
  pageToken?: string;
  latitude?: string;
  longitude?: string;
  type?: string;
  radius?: string;
  country?: string;
  city?: string;
  state?: string;
  search?: string;
  uid: string;
  role?: string;
}

export class PlaceDetailsDto {
  placeId: string;
}

export class PhotoQueryDto {
  photo_reference: string;
  maxwidth?: string;
}

export class Address {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export class PlaceResponseDto {
  name?: string;
  domain?: string;
  phone?: string;
  website?: string;
  address?: Address;
  numberOfEmployees?: string;
  revenue?: string;
  facebook?: string;
  linkedin?: string;
  site?: string;
  googleMapsUrl?: string;
} 