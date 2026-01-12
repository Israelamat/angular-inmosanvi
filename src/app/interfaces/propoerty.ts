import { User } from "./auth";

export interface Property extends Omit<PropertyInsert, 'townId'> {
  id: number;
  createdAt: string;
  status: string;
  town: Town | null;
}



export interface Province{
  id: number,
  name: string
}

export interface Town{
  id:number,
  name: string,
  longitude: string,
  latitude: string,
  province: Province,
}

export interface PropertyInsert {
  title: string;
  description: string;
  price: number;
  address: string;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  townId: number;
  mainPhoto: string;
  provinceId: number;
  town?: Town | null;
  mine?: boolean
}

export interface PropertyFormModel {
  title: string;
  description: string;
  price: number;
  address: string;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  townId: string;     
  mainPhoto: string;
  provinceId: string; 
} 

export interface ProvincesResponse{
  provinces:Province[]
}

export interface TownsResponse{
  towns: Town[]
}

export interface PropertiesResponse{
  properties: Property[]
}

export interface SinglePropertyResponse{
  property:Property
}

export interface SinglePropertyResponseInsert{
  property:PropertyInsert
}

export interface Rating {
  id: number;
  rating: number;
  comment: string;
  property: number;
  user: User;
}

export interface RatingsResponse {
  ratings: Rating[];
}

export interface RatingInsert {
  property: number;
  rating: number;
  comment: string;
}
