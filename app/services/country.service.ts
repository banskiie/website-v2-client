// app/services/country.service.ts

export interface RestCountry {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca2: string;  // 2-letter country code (e.g., "PH")
  cca3: string;  // 3-letter country code (e.g., "PHL")
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  subregion: string;
  population: number;
  area?: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  timezones: string[];
  borders?: string[];
  independent?: boolean;
  unMember?: boolean;
}

class CountryService {
  private baseUrl = 'https://restcountries.com/v3.1';
  private cache: RestCountry[] | null = null;

  async getAllCountries(): Promise<RestCountry[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      // Only request 10 fields maximum (API limit)
      const response = await fetch(
        `${this.baseUrl}/all?fields=name,cca2,cca3,flags,capital,region,subregion,population,area,languages`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`);
      }

      const data = await response.json();
      this.cache = data;
      return data;
    } catch (error) {
      console.error('Error fetching countries from REST Countries:', error);
      throw error;
    }
  }

  async getCountryByCode(code: string): Promise<RestCountry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/alpha/${code}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching country by code:', error);
      return null;
    }
  }

  async searchCountries(query: string): Promise<RestCountry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/name/${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching countries:', error);
      return [];
    }
  }

  async getCountriesByRegion(region: string): Promise<RestCountry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/region/${region}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching countries by region:', error);
      return [];
    }
  }
}

export const countryService = new CountryService();