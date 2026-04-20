import axios from 'axios';

const PSGC_API_BASE = '/api/psgc';

// ==================== TYPE DEFINITIONS ====================

// Updated to match the actual API response
export interface PSGCRegion {
  code: string;
  name: string;
  regionName?: string;
  psgcCode?: string;
}

export interface PSGCProvince {
  code: string;
  name: string;
  regionCode?: string;
  psgcCode?: string;
}

export interface PSGCCity {
  code: string;
  name: string;
  provinceCode?: string;
  regionCode?: string;
  psgcCode?: string;
  classification?: string;
  type?: string; // 'city' or 'municipality'
  district?: string;
  zip_code?: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  cityCode?: string;
  municipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  psgcCode?: string;
  status?: string;
}

export type LocationSearchResultType = 'region' | 'province' | 'city' | 'barangay';

export interface RegionSearchResult {
  type: 'region';
  code: string;
  name: string;
  psgcCode: string;
  parentName: null;
  data: PSGCRegion;
}

export interface ProvinceSearchResult {
  type: 'province';
  code: string;
  name: string;
  psgcCode: string;
  parentCode: string;
  parentName: string;
  data: PSGCProvince;
}

export interface CitySearchResult {
  type: 'city';
  code: string;
  name: string;
  psgcCode: string;
  classification: string;
  parentCode: string;
  parentName: string;
  data: PSGCCity;
}

export interface BarangaySearchResult {
  type: 'barangay';
  code: string;
  name: string;
  psgcCode: string;
  parentCode: string;
  parentName: string;
  data: PSGCBarangay;
}

export type LocationSearchResult = RegionSearchResult | ProvinceSearchResult | CitySearchResult | BarangaySearchResult;

// ==================== SERVICE CLASS ====================

class PSGCService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) return false;
    return Date.now() < expiry;
  }

  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`Fetching from Next.js API: ${PSGC_API_BASE}${endpoint}`);
      
      const response = await axios.get(`${PSGC_API_BASE}${endpoint}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      this.cache.set(cacheKey, response.data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching from API: ${endpoint}`, error);
      throw error;
    }
  }

  async getAllRegions(): Promise<PSGCRegion[]> {
    const regions = await this.fetchFromAPI<PSGCRegion[]>('/regions');
    // Transform to match expected format if needed
    return regions.map(region => ({
      ...region,
      regionName: region.name,
      psgcCode: region.code
    }));
  }

  async getAllProvinces(): Promise<PSGCProvince[]> {
    return this.fetchFromAPI<PSGCProvince[]>('/provinces');
  }

  async getAllCities(): Promise<PSGCCity[]> {
    // Note: The API might have separate endpoints for cities and municipalities
    // You might need to fetch both and combine
    try {
      const cities = await this.fetchFromAPI<PSGCCity[]>('/cities');
      const municipalities = await this.fetchFromAPI<PSGCCity[]>('/municipalities');
      return [...cities, ...municipalities];
    } catch (error) {
      // If separate endpoints don't work, try the combined endpoint
      return this.fetchFromAPI<PSGCCity[]>('/cities-municipalities');
    }
  }

  async getAllBarangays(): Promise<PSGCBarangay[]> {
    return this.fetchFromAPI<PSGCBarangay[]>('/barangays');
  }

  async getProvincesByRegion(regionCode: string): Promise<PSGCProvince[]> {
    // Use the nested endpoint if available
    try {
      return this.fetchFromAPI<PSGCProvince[]>(`/regions/${regionCode}/provinces`);
    } catch (error) {
      // Fallback to filtering all provinces
      const allProvinces = await this.getAllProvinces();
      return allProvinces.filter(p => p.regionCode === regionCode);
    }
  }

  async getCitiesByProvince(provinceCode: string): Promise<PSGCCity[]> {
    // Use the nested endpoint if available
    try {
      return this.fetchFromAPI<PSGCCity[]>(`/provinces/${provinceCode}/cities-municipalities`);
    } catch (error) {
      // Fallback to filtering all cities
      const allCities = await this.getAllCities();
      return allCities.filter(c => c.provinceCode === provinceCode);
    }
  }

  async getBarangaysByCity(cityCode: string): Promise<PSGCBarangay[]> {
    // Use the nested endpoint
    return this.fetchFromAPI<PSGCBarangay[]>(`/cities-municipalities/${cityCode}/barangays`);
  }

  async getRegionByCode(code: string): Promise<PSGCRegion | null> {
    try {
      return this.fetchFromAPI<PSGCRegion>(`/regions/${code}`);
    } catch (error) {
      return null;
    }
  }

  async getProvinceByCode(code: string): Promise<PSGCProvince | null> {
    try {
      return this.fetchFromAPI<PSGCProvince>(`/provinces/${code}`);
    } catch (error) {
      return null;
    }
  }

  async getCityByCode(code: string): Promise<PSGCCity | null> {
    try {
      return this.fetchFromAPI<PSGCCity>(`/cities-municipalities/${code}`);
    } catch (error) {
      return null;
    }
  }

  async getBarangayByCode(code: string): Promise<PSGCBarangay | null> {
    try {
      return this.fetchFromAPI<PSGCBarangay>(`/barangays/${code}`);
    } catch (error) {
      return null;
    }
  }

  async getLocationHierarchy(cityCode: string): Promise<{
    region: PSGCRegion | null;
    province: PSGCProvince | null;
    city: PSGCCity | null;
  }> {
    const city = await this.getCityByCode(cityCode);
    if (!city) return { region: null, province: null, city: null };

    const province = city.provinceCode ? await this.getProvinceByCode(city.provinceCode) : null;
    const region = province?.regionCode ? await this.getRegionByCode(province.regionCode) : null;

    return { region, province, city };
  }

  async searchLocation(searchTerm: string): Promise<LocationSearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const [regions, provinces, cities, barangays] = await Promise.all([
      this.getAllRegions(),
      this.getAllProvinces(),
      this.getAllCities(),
      this.getAllBarangays()
    ]);

    const searchLower = searchTerm.toLowerCase();
    const results: LocationSearchResult[] = [];

    // Search regions
    for (const region of regions) {
      if (region.name.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'region',
          code: region.code,
          name: region.name,
          psgcCode: region.code,
          parentName: null,
          data: region
        });
      }
    }

    // Search provinces
    for (const province of provinces) {
      if (province.name.toLowerCase().includes(searchLower)) {
        const region = regions.find(r => r.code === province.regionCode);
        results.push({
          type: 'province',
          code: province.code,
          name: province.name,
          psgcCode: province.code,
          parentCode: province.regionCode || '',
          parentName: region?.name || 'Unknown Region',
          data: province
        });
      }
    }

    // Search cities
    for (const city of cities) {
      if (city.name.toLowerCase().includes(searchLower)) {
        const province = provinces.find(p => p.code === city.provinceCode);
        results.push({
          type: 'city',
          code: city.code,
          name: city.name,
          psgcCode: city.code,
          classification: city.type || city.classification || 'Municipality',
          parentCode: city.provinceCode || '',
          parentName: province?.name || 'Unknown Province',
          data: city
        });
      }
    }

    // Search barangays
    for (const barangay of barangays) {
      if (barangay.name.toLowerCase().includes(searchLower)) {
        const city = cities.find(c => c.code === (barangay.cityCode || barangay.municipalityCode));
        results.push({
          type: 'barangay',
          code: barangay.code,
          name: barangay.name,
          psgcCode: barangay.code,
          parentCode: barangay.cityCode || barangay.municipalityCode || '',
          parentName: city?.name || 'Unknown City',
          data: barangay
        });
      }
    }

    return results.slice(0, 50);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const psgcService = new PSGCService();