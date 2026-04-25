"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Globe, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { psgcService, PSGCRegion, PSGCProvince, PSGCCity, PSGCBarangay } from "@/app/services/psgc.service"
import { countryService, RestCountry } from "@/app/services/country.service"

export interface Country {
  code: string
  name: string
  alpha2Code?: string
  alpha3Code?: string
  flag?: string
  region?: string
  capital?: string
  population?: number
  area?: number
}

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
  country?: Country
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
  eventLocation?: 'LOCAL' | 'NATIONAL' | 'MINDANAO' | 'INTERNATIONAL'
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

export const LocationSelector = ({ value, onChange, disabled, eventLocation }: LocationSelectorProps) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(value?.country)
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(value?.region)
  const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(value?.province)
  const [selectedCity, setSelectedCity] = useState<City | undefined>(value?.city)
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | undefined>(value?.barangay)
  const [street, setStreet] = useState<string>(value?.street || "")
  const [zipCode, setZipCode] = useState<string>(value?.zipCode || "")
  
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  
  const [regionsLoading, setRegionsLoading] = useState(true)
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [barangaysLoading, setBarangaysLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [countrySearchOpen, setCountrySearchOpen] = useState(false)
  
  const isUpdatingFromProps = useRef(false)
  const isUpdatingFromInternal = useRef(false)
  const previousValueRef = useRef(value)
  const isAutoSetting = useRef(false)
  const autoSetAttempts = useRef(0)

  const isPhilippines = selectedCountry?.code === "PH" || selectedCountry?.name === "Philippines"
  const shouldAutoSetLocal = eventLocation === 'LOCAL'
  const shouldAutoSetCountryOnly = eventLocation === 'NATIONAL'
  const shouldAutoSetMindanao = eventLocation === 'MINDANAO'
  const shouldBeManual = eventLocation === 'INTERNATIONAL'

  // Load countries from REST Countries API
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setCountriesLoading(true)
        const apiCountries = await countryService.getAllCountries()
        
        const mappedCountries: Country[] = apiCountries.map((c: RestCountry) => ({
          code: c.cca2,
          name: c.name.common,
          alpha2Code: c.cca2,
          alpha3Code: c.cca3,
          flag: c.flags?.png || c.flags?.svg,
          region: c.region,
          capital: c.capital?.[0],
          population: c.population,
          area: c.area
        }))
        
        setCountries(mappedCountries)
        
        if ((shouldAutoSetLocal || shouldAutoSetCountryOnly || shouldAutoSetMindanao) && !selectedCountry) {
          const philippines = mappedCountries.find(c => c.code === 'PH')
          if (philippines) {
            setSelectedCountry(philippines)
          }
        }
      } catch (err: any) {
        console.error("Error loading countries:", err)
        setError(err.message || "Failed to load countries")
      } finally {
        setCountriesLoading(false)
      }
    }
    loadCountries()
  }, [])

  useEffect(() => {
    if (!shouldAutoSetLocal) {
      return
    }
    
    autoSetAttempts.current = 0
    
    const autoSetLocation = async () => {
      if (isAutoSetting.current) {
        return
      }
      
      isAutoSetting.current = true
      
      try {
        if (!selectedCountry || selectedCountry.code !== 'PH') {
          const philippines = countries.find(c => c.code === 'PH')
          if (philippines) {
            setSelectedCountry(philippines)
          } else {
            return
          }
        }
        
        if (regions.length === 0) {
          return
        }
        
        if (!selectedRegion) {
          const regionX = regions.find(r => {
            const nameLower = r.name.toLowerCase()
            const codeLower = r.code.toLowerCase()
            const psgcCodeLower = r.psgcCode.toLowerCase()
            
            return nameLower.includes('region x') || 
                   nameLower.includes('northern mindanao') ||
                   nameLower === 'region x' ||
                   codeLower === '10' ||
                   psgcCodeLower === '100000000'
          })
          
          if (regionX) {
            setSelectedRegion(regionX)
          } else {
            return
          }
        }
        
        if (provinces.length === 0) {
          return
        }
        
        if (!selectedProvince) {
          const misamisOriental = provinces.find(p => {
            const nameLower = p.name.toLowerCase()
            return nameLower.includes('misamis oriental') ||
                   nameLower === 'misamis oriental'
          })
          
          if (misamisOriental) {
            setSelectedProvince(misamisOriental)
          } else {
            return
          }
        }
        
        if (cities.length === 0) {
          return
        }
        
        if (!selectedCity) {
          const cagayanDeOro = cities.find(c => {
            const nameLower = c.name.toLowerCase()
            return nameLower.includes('cagayan de oro') ||
                   nameLower === 'cagayan de oro' ||
                   nameLower.includes('cagayan de oro city')
          })
          
          if (cagayanDeOro) {
            setSelectedCity(cagayanDeOro)
          } else {
            return
          }
        }
        
      } catch (error) {
        console.error("Error in LOCAL auto-set:", error)
      } finally {
        isAutoSetting.current = false
      }
    }
    
    const timer = setTimeout(() => {
      autoSetLocation()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [shouldAutoSetLocal, countries, regions, provinces, cities, selectedCountry, selectedRegion, selectedProvince, selectedCity, eventLocation])

  useEffect(() => {
    if (!shouldAutoSetMindanao) {
      return
    }
    
    autoSetAttempts.current = 0
    
    const autoSetMindanaoLocation = async () => {
      if (isAutoSetting.current) {
        return
      }
      
      isAutoSetting.current = true
      
      try {
        if (!selectedCountry || selectedCountry.code !== 'PH') {
          const philippines = countries.find(c => c.code === 'PH')
          if (philippines) {
            setSelectedCountry(philippines)
          } else {
            return
          }
        }
        
        if (regions.length === 0) {
          return
        }
        
        if (!selectedRegion) {
          const regionX = regions.find(r => {
            const nameLower = r.name.toLowerCase()
            const codeLower = r.code.toLowerCase()
            const psgcCodeLower = r.psgcCode.toLowerCase()
            
            return nameLower.includes('region x') || 
                   nameLower.includes('northern mindanao') ||
                   nameLower === 'region x' ||
                   codeLower === '10' ||
                   psgcCodeLower === '100000000'
          })
          
          if (regionX) {
            setSelectedRegion(regionX)
          } else {
            return
          }
        }
        
      } catch (error) {
        console.error("Error in MINDANAO auto-set:", error)
      } finally {
        isAutoSetting.current = false
      }
    }
    
    const timer = setTimeout(() => {
      autoSetMindanaoLocation()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [shouldAutoSetMindanao, countries, regions, selectedCountry, selectedRegion, eventLocation])

  useEffect(() => {
    if ((shouldAutoSetLocal || shouldAutoSetMindanao) && selectedCity && selectedBarangay) {
      setSelectedBarangay(undefined)
    }
  }, [shouldAutoSetLocal, shouldAutoSetMindanao, selectedCity])

  useEffect(() => {
    if (isUpdatingFromInternal.current) return
    
    if (JSON.stringify(previousValueRef.current) === JSON.stringify(value)) return

    previousValueRef.current = value
    isUpdatingFromProps.current = true

    if (value) {
      setSelectedCountry(value.country)
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
      if (!isPhilippines) {
        setRegions([])
        return
      }
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
  }, [isPhilippines])

  useEffect(() => {
    const loadProvinces = async () => {
      if (!selectedRegion || !isPhilippines) {
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
  }, [selectedRegion, isPhilippines])

  useEffect(() => {
    const loadCities = async () => {
      if (!selectedProvince || !isPhilippines) {
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
  }, [selectedProvince, isPhilippines])

  useEffect(() => {
    const loadBarangays = async () => {
      if (!selectedCity || !isPhilippines) {
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
  }, [selectedCity, isPhilippines])

  const prevStateRef = useRef({ selectedCountry, selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode })

  useEffect(() => {
    if (isUpdatingFromProps.current) return

    const prev = prevStateRef.current
    const hasChanged = 
      prev.selectedCountry?.code !== selectedCountry?.code ||
      prev.selectedRegion?.code !== selectedRegion?.code ||
      prev.selectedProvince?.code !== selectedProvince?.code ||
      prev.selectedCity?.code !== selectedCity?.code ||
      prev.selectedBarangay?.code !== selectedBarangay?.code ||
      prev.street !== street ||
      prev.zipCode !== zipCode

    if (!hasChanged) return

    prevStateRef.current = { selectedCountry, selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode }

    const addressParts: string[] = []
    if (street) addressParts.push(street)
    if (selectedBarangay?.name) addressParts.push(selectedBarangay.name)
    if (selectedCity?.name) addressParts.push(selectedCity.name)
    if (selectedProvince?.name) addressParts.push(selectedProvince.name)
    if (selectedRegion?.name) addressParts.push(selectedRegion.name)
    if (selectedCountry?.name) addressParts.push(selectedCountry.name)
    if (zipCode) addressParts.push(zipCode)

    const fullAddress = addressParts.join(", ")

    isUpdatingFromInternal.current = true
    
    onChange({
      country: selectedCountry,
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
  }, [selectedCountry, selectedRegion, selectedProvince, selectedCity, selectedBarangay, street, zipCode, onChange])

  const handleCountryChange = (countryCode: string) => {
    if (shouldAutoSetLocal || shouldAutoSetCountryOnly || shouldAutoSetMindanao) return
    
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      setSelectedRegion(undefined)
      setSelectedProvince(undefined)
      setSelectedCity(undefined)
      setSelectedBarangay(undefined)
      setCountrySearchOpen(false)
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
      {error && (
        <div className="text-red-500 text-sm p-2 border rounded bg-red-50 mb-2">
          Error: {error}
        </div>
      )}

      {/* Country Selection with Search - Full width on all screens */}
      <div className="mb-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Country
        </Label>
        <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countrySearchOpen}
              className="w-full justify-between"
              disabled={disabled || countriesLoading || shouldAutoSetLocal || shouldAutoSetCountryOnly || shouldAutoSetMindanao}
            >
              {selectedCountry ? (
                <div className="flex items-center gap-2">
                  {selectedCountry.flag && (
                    <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-5 h-3 object-cover" />
                  )}
                  <span className="truncate">{selectedCountry.name}</span>
                </div>
              ) : (
                <span>{countriesLoading ? "Loading countries..." : "Select Country"}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-w-[calc(100vw-2rem)]">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => handleCountryChange(country.code)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 min-w-0">
                        {country.flag && (
                          <img src={country.flag} alt={country.name} className="w-5 h-3 object-cover shrink-0" />
                        )}
                        <span className="truncate">{country.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">({country.code})</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Philippine-specific location fields - Responsive grid */}
      {isPhilippines && selectedCountry && (
        <>
          {/* Region, Province, City/Municipality, Barangay - Responsive 2x2 grid on mobile, 4x4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="mb-2">
              <Label className="text-sm font-medium">Region</Label>
              <Select 
                value={selectedRegion?.code || ""} 
                onValueChange={handleRegionChange} 
                disabled={disabled || regionsLoading || shouldAutoSetLocal || shouldAutoSetMindanao}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={regionsLoading ? "Loading regions..." : "Select Region"} />
                </SelectTrigger>
                <SelectContent>
                  {regions.length > 0 ? (
                    regions.map((region) => (
                      <SelectItem key={region.code} value={region.code}>
                        <span className="truncate">{region.name}</span>
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
                disabled={disabled || provincesLoading || !selectedRegion || shouldAutoSetLocal}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={provincesLoading ? "Loading provinces..." : "Select Province"} />
                </SelectTrigger>
                <SelectContent>
                  {provinces.length > 0 ? (
                    provinces.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        <span className="truncate">{province.name}</span>
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
                disabled={disabled || citiesLoading || !selectedProvince || shouldAutoSetLocal}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select City/Municipality"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        <span className="truncate">
                          {city.name} {city.classification === 'City' ? '(City)' : '(Municipality)'}
                        </span>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={barangaysLoading ? "Loading barangays..." : "Select Barangay"} />
                </SelectTrigger>
                <SelectContent>
                  {barangays.length > 0 ? (
                    barangays.map((barangay) => (
                      <SelectItem key={barangay.code} value={barangay.code}>
                        <span className="truncate">{barangay.name}</span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No barangays available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Street Address and ZIP Code - Responsive stack on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 mb-2">
              <Label className="text-sm font-medium">Street Address (Optional)</Label>
              <Input
                placeholder="House number, street, subdivision"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={disabled}
                className="w-full"
              />
            </div>

            <div className="sm:w-48 mb-2">
              <Label className="text-sm font-medium">ZIP Code (Optional)</Label>
              <Input
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                disabled={disabled}
                maxLength={4}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}

      {/* For non-Philippines countries - Responsive layout */}
      {!isPhilippines && selectedCountry && !shouldAutoSetLocal && !shouldAutoSetCountryOnly && !shouldAutoSetMindanao && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 mb-2">
              <Label className="text-sm font-medium">City/State/Province</Label>
              <Input
                placeholder="City, State, or Province"
                value={selectedCity?.name || selectedProvince?.name || ""}
                onChange={(e) => {
                  setSelectedCity({ 
                    code: "manual", 
                    name: e.target.value, 
                    provinceCode: "", 
                    regionCode: "", 
                    psgcCode: "", 
                    classification: "City" 
                  })
                }}
                disabled={disabled}
                className="w-full"
              />
            </div>

            <div className="sm:w-48 mb-2">
              <Label className="text-sm font-medium">ZIP/Postal Code</Label>
              <Input
                placeholder="ZIP/Postal Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                disabled={disabled}
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-2">
            <Label className="text-sm font-medium">Street Address</Label>
            <Input
              placeholder="House number, street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </>
      )}

      {(selectedCountry || selectedRegion || selectedProvince || selectedCity || selectedBarangay || street) && (
        <div className="p-3 bg-gray-50 rounded-lg border mt-2">
          <Label className="text-xs text-muted-foreground">Full Address Preview</Label>
          <p className="text-sm mt-1 break-words">
            {[
              street,
              selectedBarangay?.name,
              selectedCity?.name,
              selectedProvince?.name,
              selectedRegion?.name,
              selectedCountry?.name,
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