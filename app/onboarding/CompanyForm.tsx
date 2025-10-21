"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const industries = [
  { label: "E-commerce", value: "E-commerce" },
  { label: "SaaS / Software", value: "SaaS / Software" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Finance / Banking", value: "Finance / Banking" },
  { label: "Retail", value: "Retail" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Marketing / Advertising", value: "Marketing / Advertising" },
  { label: "Consulting", value: "Consulting" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Education", value: "Education" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Technology", value: "Technology" },
  { label: "Non-profit", value: "Non-profit" },
  { label: "Other", value: "Other" },
] as const

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Company name is required.",
  }).max(255, {
    message: "Company name must be less than 255 characters.",
  }),
  industry: z.string().min(1, "Please select an industry."),
})

export function CompanyForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const { userId } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      setError("You must be logged in to create a company")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use the new Server Action
      const { createCompanyAction } = await import('@/lib/actions/company')
      const result = await createCompanyAction(values)

      if (!result.success) {
        throw new Error(result.error || "Failed to create company")
      }

      console.log("Company created:", result.company)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error creating company:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormDescription>
                The name of your company or organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Industry</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? industries.find(
                            (industry) => industry.value === field.value
                          )?.label
                        : "Select industry"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {industries.map((industry) => (
                        <CommandItem
                          value={industry.label}
                          key={industry.value}
                          onSelect={() => {
                            form.setValue("industry", industry.value)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              industry.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {industry.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your company&apos;s primary industry or sector.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Company"}
        </Button>
      </form>
    </Form>
  )
}
