"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayerSchema } from "@/validators/player.validator";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useForm } from "@tanstack/react-form";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CirclePlus,
  Trophy,
  Plus,
  Trash2,
} from "lucide-react";
import { Field, FieldLabel, FieldError, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Gender } from "@/types/shared.interface";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  LocationSelector,
  LocationData,
} from "@/components/custom/location-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const PLAYER = gql`
  query Player($_id: ID!) {
    player(_id: $_id) {
      firstName
      middleName
      lastName
      suffix
      email
      phoneNumber
      birthDate
      gender
      achievements
      address {
        country {
          code
          name
          alpha2Code
          alpha3Code
          flag
          region
          capital
          population
          area
        }
        region {
          code
          name
          regionName
          psgcCode
        }
        province {
          code
          name
          regionCode
          psgcCode
        }
        city {
          code
          name
          provinceCode
          regionCode
          psgcCode
          classification
        }
        barangay {
          code
          name
          cityCode
          provinceCode
          regionCode
          psgcCode
        }
        street
        zipCode
        fullAddress
        coordinates {
          lat
          lng
        }
      }
    }
  }
`;

const CREATE = gql`
  mutation CreatePlayer($input: CreatePlayerInput!) {
    createPlayer(input: $input) {
      ok
      message
    }
  }
`;

const UPDATE = gql`
  mutation UpdatePlayer($input: UpdatePlayerInput!) {
    updatePlayer(input: $input) {
      ok
      message
    }
  }
`;

type Props = {
  _id?: string;
  onClose?: () => void;
};

interface FormAddress {
  country?: {
    code: string;
    name: string;
    alpha2Code?: string;
    alpha3Code?: string;
    flag?: string;
    region?: string;
    capital?: string;
    population?: number;
    area?: number;
  };
  region?: {
    code: string;
    name: string;
    regionName: string;
    psgcCode: string;
  };
  province?: {
    code: string;
    name: string;
    regionCode: string;
    psgcCode: string;
  };
  city?: {
    code: string;
    name: string;
    provinceCode: string;
    regionCode: string;
    psgcCode: string;
    classification: string;
  };
  barangay?: {
    code: string;
    name: string;
    cityCode: string;
    provinceCode: string;
    regionCode: string;
    psgcCode: string;
  };
  street: string;
  zipCode: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface FormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  email: string;
  phoneNumber: string;
  birthDate: Date;
  gender: Gender;
  achievements: string[];
  address: FormAddress;
}

const FormDialog = (props: Props) => {
  const [open, setOpen] = useState(false);
  const isUpdate = Boolean(props._id);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("basic");

  const { data, loading: fetchLoading }: any = useQuery(PLAYER, {
    variables: { _id: props._id },
    skip: !open || !isUpdate,
    fetchPolicy: "no-cache",
  });

  const [submitForm] = useMutation(isUpdate ? UPDATE : CREATE);
  const isLoading = isUpdate ? isPending || fetchLoading : isPending;

  const genders = Object.values(Gender).map((gender) => ({
    label: gender.toLocaleLowerCase().replaceAll("_", " "),
    value: gender,
  }));
  const [openGenders, setOpenGenders] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      email: "",
      phoneNumber: "",
      birthDate: new Date(),
      gender: Gender.MALE,
      achievements: [],
      address: {
        country: undefined,
        region: undefined,
        province: undefined,
        city: undefined,
        barangay: undefined,
        street: "",
        zipCode: "",
        fullAddress: "",
        coordinates: undefined,
      },
    } as FormValues,
    validators: {
      onSubmit: ({ formApi, value }) => {
        try {
          PlayerSchema.parse(value);
        } catch (error: any) {
          const formErrors = JSON.parse(error);
          formErrors.map(
            ({ path, message }: { path: string; message: string }) =>
              formApi.fieldInfo[
                path as keyof typeof formApi.fieldInfo
              ]?.instance?.setErrorMap({
                onSubmit: { message },
              }),
          );
        }
      },
    },
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          const response: any = await submitForm({
            variables: {
              input: isUpdate ? { _id: props._id, ...value } : { ...value },
            },
          });
          if (response) onClose();
        } catch (error: any) {
          console.error(error.errors);
          if (error.name == "CombinedGraphQLErrors") {
            const fieldErrors = error.errors[0].extensions.fields;
            if (fieldErrors)
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  formApi.fieldInfo[
                    path as keyof typeof formApi.fieldInfo
                  ]?.instance?.setErrorMap({
                    onSubmit: { message },
                  }),
              );
          }
        }
      }),
  });

  useEffect(() => {
    if (data && isUpdate) {
      // Ensure address data is properly structured
      const addressData = data.player.address ? {
        country: data.player.address.country || undefined,
        region: data.player.address.region || undefined,
        province: data.player.address.province || undefined,
        city: data.player.address.city || undefined,
        barangay: data.player.address.barangay || undefined,
        street: data.player.address.street || "",
        zipCode: data.player.address.zipCode || "",
        fullAddress: data.player.address.fullAddress || "",
        coordinates: data.player.address.coordinates || undefined,
      } : {
        country: undefined,
        region: undefined,
        province: undefined,
        city: undefined,
        barangay: undefined,
        street: "",
        zipCode: "",
        fullAddress: "",
        coordinates: undefined,
      };

      form.reset({
        firstName: data.player.firstName || "",
        middleName: data.player.middleName || "",
        lastName: data.player.lastName || "",
        suffix: data.player.suffix || "",
        email: data.player.email || "",
        phoneNumber: data.player.phoneNumber || "",
        birthDate: data.player.birthDate ? new Date(data.player.birthDate) : new Date(),
        gender: data.player.gender || Gender.MALE,
        achievements: data.player.achievements || [],
        address: addressData,
      });

      setTimeout(() => {
        form.update();
      }, 0);
    }
  }, [data, isUpdate, form]);

  const onClose = () => {
    setOpen(false);
    props.onClose?.();
    form.reset();
  };

  const formAddressToLocationData = (address: FormAddress): LocationData => {
    return {
      country: address.country,
      region: address.region,
      province: address.province,
      city: address.city,
      barangay: address.barangay,
      street: address.street,
      zipCode: address.zipCode,
      fullAddress: address.fullAddress,
      coordinates: address.coordinates,
    };
  };

  const locationDataToFormAddress = (location: LocationData): FormAddress => {
    return {
      country: location.country
        ? {
          code: location.country.code || "",
          name: location.country.name || "",
          alpha2Code: location.country.alpha2Code,
          alpha3Code: location.country.alpha3Code,
          flag: location.country.flag,
          region: location.country.region,
          capital: location.country.capital,
          population: location.country.population,
          area: location.country.area,
        }
        : undefined,
      region: location.region
        ? {
          code: location.region.code || "",
          name: location.region.name || "",
          regionName: location.region.regionName || "",
          psgcCode: location.region.psgcCode || "",
        }
        : undefined,
      province: location.province
        ? {
          code: location.province.code || "",
          name: location.province.name || "",
          regionCode: location.province.regionCode || "",
          psgcCode: location.province.psgcCode || "",
        }
        : undefined,
      city: location.city
        ? {
          code: location.city.code || "",
          name: location.city.name || "",
          provinceCode: location.city.provinceCode || "",
          regionCode: location.city.regionCode || "",
          psgcCode: location.city.psgcCode || "",
          classification: location.city.classification || "",
        }
        : undefined,
      barangay: location.barangay
        ? {
          code: location.barangay.code || "",
          name: location.barangay.name || "",
          cityCode: location.barangay.cityCode || "",
          provinceCode: location.barangay.provinceCode || "",
          regionCode: location.barangay.regionCode || "",
          psgcCode: location.barangay.psgcCode || "",
        }
        : undefined,
      street: location.street || "",
      zipCode: location.zipCode || "",
      fullAddress: location.fullAddress || "",
      coordinates: location.coordinates,
    };
  };

  const addAchievement = () => {
    const currentAchievements = form.getFieldValue("achievements") as string[];
    form.setFieldValue("achievements", [...currentAchievements, ""]);
  };

  const removeAchievement = (index: number) => {
    const currentAchievements = form.getFieldValue("achievements") as string[];
    const newAchievements = currentAchievements.filter((_, i) => i !== index);
    form.setFieldValue("achievements", newAchievements);
  };

  const updateAchievement = (index: number, value: string) => {
    const currentAchievements = form.getFieldValue("achievements") as string[];
    const newAchievements = [...currentAchievements];
    newAchievements[index] = value;
    form.setFieldValue("achievements", newAchievements);
  };

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isUpdate ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button variant="outline-success">
            <CirclePlus className="size-3.5" />
            Add Player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="max-w-4xl!"
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Edit Player" : "Create Player"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update existing player details."
              : "Create a new player in the system."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="-mt-2 mb-2"
          id="player-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Tabs
            key={isUpdate ? props._id : "create"}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="address">Address Information</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <FieldSet className="grid grid-cols-2 place-content-start gap-3 h-[55vh] overflow-y-auto">
                <form.Field
                  name="firstName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="col-span-2">
                        <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                        <InputGroup className="-my-1">
                          <InputGroupInput
                            required
                            placeholder="First Name"
                            disabled={isLoading}
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="middleName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="col-span-2">
                        <FieldLabel htmlFor={field.name}>
                          Middle Name
                        </FieldLabel>
                        <InputGroup className="-my-1">
                          <InputGroupInput
                            placeholder="Middle Name"
                            disabled={isLoading}
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <div className="col-span-2 flex gap-3">
                  <form.Field
                    name="lastName"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="flex-1">
                          <FieldLabel htmlFor={field.name}>
                            Last Name
                          </FieldLabel>
                          <InputGroup className="-my-1">
                            <InputGroupInput
                              required
                              placeholder="Last Name"
                              disabled={isLoading}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="suffix"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field className="w-24" data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Ext.</FieldLabel>
                          <InputGroup className="-my-1">
                            <InputGroupInput
                              placeholder="Ext."
                              disabled={isLoading}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>

                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <InputGroup className="-my-1">
                          <InputGroupInput
                            placeholder="Email"
                            disabled={isLoading}
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            type="email"
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="phoneNumber"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Phone Number
                        </FieldLabel>
                        <InputGroup className="-my-1">
                          <InputGroupInput
                            placeholder="Phone Number"
                            disabled={isLoading}
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            maxLength={11}
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="birthDate"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel id="birth-date" htmlFor="birth-date">
                          Birth Date
                        </FieldLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="birth-date"
                              name="birth-date"
                              variant="outline"
                              data-empty={!field.state.value}
                              className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal flex -mt-1"
                              disabled={isLoading}
                            >
                              <CalendarIcon className="size-3.5" />
                              {field.state.value ? (
                                format(field.state.value, "PP")
                              ) : (
                                <span>Select Birth Date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              required
                              selected={field.state.value}
                              onSelect={field.handleChange}
                            />
                          </PopoverContent>
                        </Popover>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="gender"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                        <Popover
                          open={openGenders}
                          onOpenChange={setOpenGenders}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              id={field.name}
                              name={field.name}
                              disabled={isLoading}
                              aria-expanded={openGenders}
                              onBlur={field.handleBlur}
                              variant="outline"
                              role="combobox"
                              aria-invalid={isInvalid}
                              className="w-full justify-between font-normal capitalize -mt-1"
                              type="button"
                            >
                              {field.state.value
                                ? genders.find(
                                  (o) => o.value === field.state.value,
                                )?.label
                                : "Select Gender"}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Select Gender" />
                              <CommandList className="max-h-72 overflow-y-auto">
                                <CommandEmpty>No gender found.</CommandEmpty>
                                <CommandGroup>
                                  <Label className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
                                    Gender
                                  </Label>
                                  {genders?.map((o) => (
                                    <CommandItem
                                      key={o.value}
                                      value={o.value}
                                      onSelect={(val) => {
                                        field.handleChange(val as Gender);
                                        setOpenGenders(false);
                                      }}
                                      className="capitalize"
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "h-4 w-4",
                                          field.state.value === o.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {o.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldSet>
            </TabsContent>

            <TabsContent value="address">
              <FieldSet className="h-[55vh] overflow-y-auto">
                <form.Field
                  name="address"
                  children={(field) => {
                    return (
                      <Field key={JSON.stringify(field.state.value)}>
                        <LocationSelector
                          value={formAddressToLocationData(field.state.value)}
                          onChange={(location) => {
                            field.handleChange(
                              locationDataToFormAddress(location),
                            );
                          }}
                          disabled={isLoading}
                        />
                        {field.state.meta.isTouched &&
                          !field.state.meta.isValid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                      </Field>
                    );
                  }}
                />
              </FieldSet>
            </TabsContent>

            <TabsContent value="achievements">
              <FieldSet className="h-[55vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <Label className="text-sm font-medium">Achievements</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAchievement}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Achievement
                    </Button>
                  </div>

                  <form.Field
                    name="achievements"
                    children={() => {
                      const achievements = form.getFieldValue("achievements") as string[];
                      return (
                        <div className="space-y-3">
                          {achievements.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No achievements added yet.</p>
                              <p className="text-xs">Click the button above to add achievements.</p>
                            </div>
                          ) : (
                            achievements.map((_, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <Input
                                    placeholder={`Achievement ${index + 1}`}
                                    value={achievements[index]}
                                    onChange={(e) => updateAchievement(index, e.target.value)}
                                    disabled={isLoading}
                                    className="w-full"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAchievement(index)}
                                  disabled={isLoading}
                                  className="h-10 w-10 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    }}
                  />

                  <p className="text-xs text-muted-foreground mt-2">
                    Add the player's achievements, awards, tournament wins, or recognitions.
                  </p>
                </div>
              </FieldSet>
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-20" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-20"
            loading={isLoading}
            type="submit"
            form="player-form"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;