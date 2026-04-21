"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Loader2 } from "lucide-react"
import { psgcService, PSGCRegion, PSGCProvince, PSGCCity, PSGCBarangay } from "@/app/services/psgc.service"

export interface Region {
  code: string
  name: string
  regionName: string
  psgcCode: string
}

export interface Province {
  code: string
  name: string
  regionCode: string
  psgcCode: string
}

export interface City {
  code: string
  name: string
  provinceCode: string
  regionCode: string
  psgcCode: string
  classification: string
}

export interface Barangay {
  code: string
  name: string
  cityCode: string
  provinceCode: string
  regionCode: string
  psgcCode: string
}

export interface LocationData {
  region?: Region
  province?: Province
  city?: City
  barangay?: Barangay
  street?: string
  zipCode?: string
  fullAddress: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface LocationSelectorProps {
  value?: LocationData
  onChange: (location: LocationData) => void
  disabled?: boolean
}

const convertToRegion = (serviceRegion: PSGCRegion): Region => ({
  code: serviceRegion.code,
  name: serviceRegion.name,
  regionName: serviceRegion.regionName || serviceRegion.name,
  psgcCode: serviceRegion.psgcCode || serviceRegion.code
})

const convertToProvince = (serviceProvince: PSGCProvince, regionCode: string): Province => ({
  code: serviceProvince.code,
  name: serviceProvince.name,
  regionCode: regionCode || serviceProvince.regionCode || '',
  psgcCode: serviceProvince.psgcCode || serviceProvince.code
})

const convertToCity = (serviceCity: PSGCCity, provinceCode: string, regionCode: string): City => ({
  code: serviceCity.code,
  name: serviceCity.name,
  provinceCode: provinceCode || serviceCity.provinceCode || '',
  regionCode: regionCode || serviceCity.regionCode || '',
  psgcCode: serviceCity.psgcCode || serviceCity.code,
  classification: serviceCity.classification || serviceCity.type || 'Municipality'
})

const convertToBarangay = (serviceBarangay: PSGCBarangay, cityCode: string, provinceCode: string, regionCode: string): Barangay => ({
  code: serviceBarangay.code,
  name: serviceBarangay.name,
  cityCode: cityCode || serviceBarangay.cityCode || serviceBarangay.municipalityCode || '',
  provinceCode: provinceCode || serviceBarangay.provinceCode || '',
  regionCode: regionCode || serviceBarangay.regionCode || '',
  psgcCode: serviceBarangay.psgcCode || serviceBarangay.code
})

export const LocationSelector = ({ value, onChange, disabled }: LocationSelectorProps) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(value?.region)
  const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(value?.province)
  const [selectedCity, setSelectedCity] = useState<City | undefined>(value?.city)
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | undefined>(value?.barangay)
  const [street, setStreet] = useState<string>(value?.street || "")
  const [zipCode, setZipCode] = useState<string>(value?.zipCode || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)
  
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  
  const [regionsLoading, setRegionsLoading] = useState(true)
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [barangaysLoading, setBarangaysLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isUpdatingFromProps = useRef(false)
  const isUpdatingFromInternal = useRef(false)
  const previousValueRef = useRef(value)

  useEffect(() => {
    if (isUpdatingFromInternal.current) return
    
    if (JSON.stringify(previousValueRef.current) === JSON.stringify(value)) return

    previousValueRef.current = value
    isUpdatingFromProps.current = true

    if (value) {
      setSelectedRegion(value.region)
      setSelectedProvince(value.province)
      setSelectedCity(value.city)
      setSelectedBarangay(value.barangay)
      setStreet(value.street || "")
      setZipCode(value.zipCode || "")
    }

    setTimeout(() => {
      isUpdatingFromProps.current = false
    }, 0)
  }, [value])

  useEffect(() => {
    const loadRegions = async () => {
      try {
        setRegionsLoading(true)
        setError(null)
        const regionsData = await psgcService.getAllRegions()
        const convertedRegions = regionsData.map(convertToRegion)
        setRegions(convertedRegions)
      } catch (err: any) {
        console.error("Error loading regions:", err)
        setError(err.message || "Failed to load regions")
      } finally {
        setRegionsLoading(false)
      }
    }
    loadRegions()
  }, [])

  useEffect(() => {
    const loadProvinces = async () => {
      if (!selectedRegion) {
        setProvinces([])
        return
      }
      try {
        setProvincesLoading(true)
        const provincesData = await psgcService.getProvincesByRegion(selectedRegion.code)
        const convertedProvinces = provincesData.map(p => convertToProvince(p, selectedRegion.code))
        setProvinces(convertedProvinces)
      } catch (err: any) {
        console.error("Error loading provinces:", err)
      } finally {
        setProvincesLoading(false)
      }
    }
    loadProvinces()
  }, [selectedRegion])

  useEffect(() => {
    const loadCities = async () => {
      if (!selectedProvince) {
        setCities([])
        return
      }
      try {
        setCitiesLoading(true)
        const citiesData = await psgcService.getCitiesByProvince(selectedProvince.code)
        const convertedCities = citiesData.map(c => convertToCity(c, selectedProvince.code, selectedProvince.regionCode))
        setCities(convertedCities)
      } catch (err: any) {
        console.error("Error loading cities:", err)
      } finally {
        setCitiesLoading(false)
      }
    }
    loadCities()
  }, [selectedProvince])

  useEffect(() => {
    const loadBarangays = async () => {
      if (!selectedCity) {
        setBarangays([])
        return
      }
      try {
        setBarangaysLoading(true)
        const barangaysData = await psgcService.getBarangaysByCity(selectedCity.code)
        const convertedBarangays = barangaysData.map(b => convertToBarangay(b, selectedCity.code, selectedCity.provinceCode, selectedCity.regionCode))
        setBarangays(convertedBarangays)
      } catch (err: any) {
        console.error("Error loading barangays:", err)
      } finally {
        setBarangaysLoading(false)
      }
    }
    loadBarangays()
  }, [selectedCity])

  const prevStateRef = useRef({ selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode })

  useEffect(() => {
    if (isUpdatingFromProps.current) return

    const prev = prevStateRef.current
    const hasChanged = 
      prev.selectedRegion !== selectedRegion ||
      prev.selectedProvince !== selectedProvince ||
      prev.selectedCity !== selectedCity ||
      prev.selectedBarangay !== selectedBarangay ||
      prev.street !== street ||
      prev.zipCode !== zipCode

    if (!hasChanged) return

    prevStateRef.current = { selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode }

    const addressParts: string[] = []
    if (street) addressParts.push(street)
    if (selectedBarangay?.name) addressParts.push(selectedBarangay.name)
    if (selectedCity?.name) addressParts.push(selectedCity.name)
    if (selectedProvince?.name) addressParts.push(selectedProvince.name)
    if (selectedRegion?.name) addressParts.push(selectedRegion.name)
    if (zipCode) addressParts.push(zipCode)

    const fullAddress = addressParts.join(", ")

    isUpdatingFromInternal.current = true
    
    onChange({
      region: selectedRegion,
      province: selectedProvince,
      city: selectedCity,
      barangay: selectedBarangay,
      street,
      zipCode,
      fullAddress,
    })

    setTimeout(() => {
      isUpdatingFromInternal.current = false
    }, 0)
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode, onChange])

  const handleSearch = async () => {
    if (searchTerm.length < 2) return
    
    try {
      setSearchLoading(true)
      const results = await psgcService.searchLocation(searchTerm)
      const transformedResults = results.map((result: any) => {
        if (result.type === 'region') {
          return { ...result, parentName: null }
        } else if (result.type === 'province') {
          const region = regions.find(r => r.code === result.parentCode)
          return { ...result, parentName: region?.name || result.parentName }
        } else if (result.type === 'city') {
          const province = provinces.find(p => p.code === result.parentCode)
          return { ...result, parentName: province?.name || result.parentName }
        } else if (result.type === 'barangay') {
          const city = cities.find(c => c.code === result.parentCode)
          return { ...result, parentName: city?.name || result.parentName }
        }
        return result
      })
      setSearchResults(transformedResults)
      setShowSearch(true)
    } catch (err: any) {
      console.error("Search error:", err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleRegionChange = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode)
    if (region) {
      setSelectedRegion(region)
      setSelectedProvince(undefined)
      setSelectedCity(undefined)
      setSelectedBarangay(undefined)
    }
  }

  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find(p => p.code === provinceCode)
    if (province) {
      setSelectedProvince(province)
      setSelectedCity(undefined)
      setSelectedBarangay(undefined)
    }
  }

  const handleCityChange = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode)
    if (city) {
      setSelectedCity(city)
      setSelectedBarangay(undefined)
    }
  }

  const handleBarangayChange = (barangayCode: string) => {
    const barangay = barangays.find(b => b.code === barangayCode)
    if (barangay) {
      setSelectedBarangay(barangay)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Section - Uncomment if needed */}
      {/* <div className="flex gap-2 mb-2">
        <Input
          placeholder="Search location (e.g., 'Cebu', 'Manila', 'Davao')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={disabled}
        />
        <Button onClick={handleSearch} type="button" variant="outline" disabled={disabled || searchLoading}>
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {showSearch && searchResults.length > 0 && (
        <div className="border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto mb-2">
          <Label className="text-sm font-medium">Search Results</Label>
          {searchResults.map((result) => (
            <div
              key={result.code}
              className="p-2 hover:bg-gray-50 cursor-pointer rounded flex items-start gap-2"
              onClick={async () => {
                if (result.type === 'region') {
                  handleRegionChange(result.code)
                } else if (result.type === 'province') {
                  if (result.parentCode) {
                    const parentRegion = regions.find(r => r.code === result.parentCode)
                    if (parentRegion) setSelectedRegion(parentRegion)
                  }
                  const provinceObj: Province = {
                    code: result.code,
                    name: result.name,
                    regionCode: result.parentCode || selectedRegion?.code || '',
                    psgcCode: result.psgcCode || result.code
                  }
                  setSelectedProvince(provinceObj)
                  setSelectedCity(undefined)
                  setSelectedBarangay(undefined)
                } else if (result.type === 'city') {
                  if (result.parentCode && selectedProvince) {
                    setSelectedProvince(prev => prev || undefined)
                  }
                  const cityObj: City = {
                    code: result.code,
                    name: result.name,
                    provinceCode: result.parentCode || selectedProvince?.code || '',
                    regionCode: selectedProvince?.regionCode || selectedRegion?.code || '',
                    psgcCode: result.psgcCode || result.code,
                    classification: result.classification || 'Municipality'
                  }
                  setSelectedCity(cityObj)
                  setSelectedBarangay(undefined)
                } else if (result.type === 'barangay') {
                  const barangayObj: Barangay = {
                    code: result.code,
                    name: result.name,
                    cityCode: result.parentCode || selectedCity?.code || '',
                    provinceCode: selectedCity?.provinceCode || selectedProvince?.code || '',
                    regionCode: selectedCity?.regionCode || selectedProvince?.regionCode || selectedRegion?.code || '',
                    psgcCode: result.psgcCode || result.code
                  }
                  setSelectedBarangay(barangayObj)
                }
                setShowSearch(false)
                setSearchTerm("")
              }}
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">{result.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {result.type} {result.parentName && `• ${result.parentName}`}
                  {'classification' in result && result.classification && ` • ${result.classification}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )} */}

      {error && (
        <div className="text-red-500 text-sm p-2 border rounded bg-red-50 mb-2">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <div className="mb-2">
          <Label className="text-sm font-medium">Region</Label>
          <Select 
            value={selectedRegion?.code || ""} 
            onValueChange={handleRegionChange} 
            disabled={disabled || regionsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={regionsLoading ? "Loading regions..." : "Select Region"} />
            </SelectTrigger>
            <SelectContent>
              {regions.length > 0 ? (
                regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>No regions available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-2">
          <Label className="text-sm font-medium">Province</Label>
          <Select 
            value={selectedProvince?.code || ""} 
            onValueChange={handleProvinceChange} 
            disabled={disabled || provincesLoading || !selectedRegion}
          >
            <SelectTrigger>
              <SelectValue placeholder={provincesLoading ? "Loading provinces..." : "Select Province"} />
            </SelectTrigger>
            <SelectContent>
              {provinces.length > 0 ? (
                provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>No provinces available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-2">
          <Label className="text-sm font-medium">City/Municipality</Label>
          <Select 
            value={selectedCity?.code || ""} 
            onValueChange={handleCityChange} 
            disabled={disabled || citiesLoading || !selectedProvince}
          >
            <SelectTrigger>
              <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select City/Municipality"} />
            </SelectTrigger>
            <SelectContent>
              {cities.length > 0 ? (
                cities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name} {city.classification === 'City' ? '(City)' : '(Municipality)'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>No cities available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-2">
          <Label className="text-sm font-medium">Barangay</Label>
          <Select 
            value={selectedBarangay?.code || ""} 
            onValueChange={handleBarangayChange} 
            disabled={disabled || barangaysLoading || !selectedCity}
          >
            <SelectTrigger>
              <SelectValue placeholder={barangaysLoading ? "Loading barangays..." : "Select Barangay"} />
            </SelectTrigger>
            <SelectContent>
              {barangays.length > 0 ? (
                barangays.map((barangay) => (
                  <SelectItem key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>No barangays available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-2">
        <Label className="text-sm font-medium">Street Address (Optional)</Label>
        <Input
          placeholder="House number, street, subdivision"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="mb-2">
        <Label className="text-sm font-medium">ZIP Code (Optional)</Label>
        <Input
          placeholder="ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          disabled={disabled}
          maxLength={4}
        />
      </div>

      {(selectedRegion || selectedProvince || selectedCity || selectedBarangay || street) && (
        <div className="p-3 bg-gray-50 rounded-lg border mt-2">
          <Label className="text-xs text-muted-foreground">Full Address Preview</Label>
          <p className="text-sm mt-1">
            {[
              street,
              selectedBarangay?.name,
              selectedCity?.name,
              selectedProvince?.name,
              selectedRegion?.name,
              zipCode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  )
}