import { countriesData, Country } from "@/public/json/countries";

class CountryService {
  private cache: Country[] | null = null;

  async getAllCountries(): Promise<Country[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      // Use the imported TypeScript data directly
      this.cache = countriesData;
      return this.cache;
    } catch (error) {
      console.error('Error loading countries:', error);
      throw error;
    }
  }

  async getCountryByCode(code: string): Promise<Country | null> {
    try {
      const countries = await this.getAllCountries();
      const upperCode = code.toUpperCase();
      return countries.find(
        (country) => country.cca2 === upperCode || country.cca3 === upperCode
      ) || null;
    } catch (error) {
      console.error('Error fetching country by code:', error);
      return null;
    }
  }

  async searchCountries(query: string): Promise<Country[]> {
    try {
      const countries = await this.getAllCountries();
      const searchTerm = query.toLowerCase();
      return countries.filter(
        (country) =>
          country.name.common.toLowerCase().includes(searchTerm) ||
          country.name.official.toLowerCase().includes(searchTerm) ||
          country.cca2.toLowerCase().includes(searchTerm) ||
          country.cca3.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching countries:', error);
      return [];
    }
  }

  async getCountriesByRegion(region: string): Promise<Country[]> {
    try {
      const countries = await this.getAllCountries();
      return countries.filter((country) =>
        country.name.common.toLowerCase().includes(region.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching countries by region:', error);
      return [];
    }
  }
}

export const countryService = new CountryService();