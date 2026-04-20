import { gql } from "@apollo/client"

export const GET_ALL_REGIONS = gql`
  query GetAllRegions {
    getAllRegions {
      code
      name
      regionName
      psgcCode
    }
  }
`

export const GET_PROVINCES_BY_REGION = gql`
  query GetProvincesByRegion($regionCode: String!) {
    getProvincesByRegion(regionCode: $regionCode) {
      code
      name
      regionCode
      psgcCode
    }
  }
`

export const GET_CITIES_BY_PROVINCE = gql`
  query GetCitiesByProvince($provinceCode: String!) {
    getCitiesByProvince(provinceCode: $provinceCode) {
      code
      name
      provinceCode
      regionCode
      psgcCode
      classification
    }
  }
`

export const GET_BARANGAYS_BY_CITY = gql`
  query GetBarangaysByCity($cityCode: String!) {
    getBarangaysByCity(cityCode: $cityCode) {
      code
      name
      cityCode
      provinceCode
      regionCode
      psgcCode
    }
  }
`

export const SEARCH_LOCATION = gql`
  query SearchLocation($searchTerm: String!) {
    searchLocation(searchTerm: $searchTerm) {
      type
      code
      name
      psgcCode
      parentCode
      parentName
      classification
    }
  }
`