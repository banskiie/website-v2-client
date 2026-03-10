"use client"
import React, { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import z from "zod"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { HoverCard, HoverCardTrigger } from "@radix-ui/react-hover-card"
import { HoverCardContent } from "@/components/ui/hover-card"
import { useAuthStore } from "@/store/auth.store"
import { LoginSchema } from "@/validators/auth.validator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

const Login = () => {
  const [isPending, startTransition] = React.useTransition()
  const signIn = useAuthStore((state) => state.signIn)
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
    validators: {
      onSubmit: LoginSchema,
      onChange: LoginSchema,
    },
    listeners: {
      onChangeDebounceMs: 300,
    }, // this is just for demo purposes
    onSubmit: ({ value, formApi }) =>
      startTransition(async () => {
        try {
          const res = await signIn({
            username: value.username,
            password: value.password,
            rememberMe: value.rememberMe,
          })
          // console.log(res)
        } catch (error: any) {
          console.error(error)
          if (error.name == "CombinedGraphQLErrors") {
            if (error.errors[0].extensions.code == "INVALID_CREDENTIALS")
              formApi.fieldInfo.username.instance?.setErrorMap({
                onSubmit: { message: error.errors[0].message },
              })
            const fieldErrors = error.errors[0].extensions.fields
            if (fieldErrors) {
              fieldErrors.map(
                ({ path, message }: { path: string; message: string }) =>
                  formApi.fieldInfo[
                    path as keyof typeof formApi.fieldInfo
                  ].instance?.setErrorMap({
                    onSubmit: { message },
                  }),
              )
            }
          }
        }
      }),
  })

  return (
    <div className="bg-white h-screen w-full flex items-center justify-center">
      <div className="w-[360px] flex flex-col gap-2.5">
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldSet>
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        disabled={isPending}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Username"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        disabled={isPending}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Password"
                        type="password"
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="rememberMe"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field
                    orientation="horizontal"
                    data-invalid={isInvalid}
                    className="w-fit py-2"
                  >
                    <HoverCard>
                      <HoverCardTrigger>
                        <Checkbox
                          disabled={isPending}
                          id="remember-me"
                          name={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked === true)
                          }
                        />
                      </HoverCardTrigger>
                      <HoverCardContent
                        align="center"
                        side="bottom"
                        className="px-2 py-1.5 text-xs text-muted-foreground w-fit"
                      >
                        Stay logged in for the next 90 days.
                      </HoverCardContent>
                    </HoverCard>
                    <FieldContent>
                      <FieldLabel htmlFor="remember-me">
                        Remember me?
                      </FieldLabel>
                    </FieldContent>
                  </Field>
                )
              }}
            />
          </FieldSet>
        </form>
        <Button loading={isPending} type="submit" form="login-form">
          Submit
        </Button>
        <Button variant="link">Forgot Password?</Button>
      </div>
    </div>
  )
}

export default Login
