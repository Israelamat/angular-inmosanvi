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