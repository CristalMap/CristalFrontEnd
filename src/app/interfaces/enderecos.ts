export interface Enderecos {
    type:        string;
    query:       string[];
    features:    Feature[];
    attribution: string;
}

export interface Feature {
    id:                   string;
    type:                 string;
    place_type:           string[];
    relevance:            number;
    properties:           Properties;
    text:                 string;
    place_name:           string;
    center:               number[];
    geometry:             Geometry;
    context:              Context[];
    matching_place_name?: string;
    matching_text?:       string;
}

export interface Context {
    id:          string;
    mapbox_id?:  string;
    text:        string;
    wikidata?:   string;
    short_code?: string;
}

export interface Geometry {
    type:        string;
    coordinates: number[];
}

export interface Properties {
    accuracy?:   string;
    mapbox_id?:  string;
    foursquare?: string;
    landmark?:   boolean;
    address?:    string;
    category?:   string;
    maki?:       string;
}