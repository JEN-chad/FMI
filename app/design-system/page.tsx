"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Plus,
  Trash,
  Settings,
  Mail,
  Home,
  Database,
  Building,
  Upload,
  Calendar,
  Shield,
  FileText,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Toaster } from "@/components/ui/sonner"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { Stepper, type StepItem } from "@/components/ui/stepper"
import { Navbar } from "@/components/ui/navbar"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/loading-state"
import { MetricsCard } from "@/components/ui/metrics-card"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"

// Charts Configuration
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartData = [
  { month: "January", buyers: 186, sellers: 80 },
  { month: "February", buyers: 305, sellers: 200 },
  { month: "March", buyers: 237, sellers: 120 },
  { month: "April", buyers: 73, sellers: 190 },
  { month: "May", buyers: 209, sellers: 130 },
  { month: "June", buyers: 214, sellers: 140 },
]

const chartConfig: ChartConfig = {
  buyers: {
    label: "Verified Buyers",
    color: "hsl(var(--primary))",
  },
  sellers: {
    label: "Active Sellers",
    color: "oklch(0.556 0 0)",
  },
}

export default function DesignSystemPage() {
  const [activeStep, setActiveStep] = React.useState(1)
  const [loadingDemo, setLoadingDemo] = React.useState(false)
  const [selectVal, setSelectVal] = React.useState("")

  const steps: StepItem[] = [
    { title: "Verification", description: "PAN & Aadhaar KYC", icon: Shield },
    { title: "Business Details", description: "GSTIN & Revenue Info", icon: Building },
    { title: "Sign NDA", description: "Mutual Agreement", icon: FileText },
    { title: "Active Listing", description: "Go live", icon: Sparkles },
  ]

  const triggerLoadingState = () => {
    setLoadingDemo(true)
    setTimeout(() => {
      setLoadingDemo(false)
      toast.success("Data fetched successfully!")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Toast provider */}
      <Toaster />

      {/* Demo Navbar */}
      <Navbar
        user={{
          name: "Amit Sharma",
          email: "amit.sharma@fmi.in",
          role: "Verified Seller",
        }}
        notificationsCount={3}
        onLogout={() => toast.info("Logout clicked!")}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">FMI Design System</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              Indian Digital Business Marketplace components built using shadcn/ui and `@base-ui/react`.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => toast.success("Toast Notification Triggered!")}>
              Test Toaster
            </Button>
            <Button variant="outline" onClick={triggerLoadingState}>
              Toggle Global Loader
            </Button>
          </div>
        </div>

        {/* Global Loading Overlay demo */}
        <LoadingState isLoading={loadingDemo} text="Simulating background operation..." fullScreen blur />

        {/* Tabs System */}
        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="flex flex-wrap w-full justify-start h-auto border-b border-border bg-transparent gap-2 p-0 select-none">
            <TabsTrigger
              value="general"
              className="py-2.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className="py-2.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Forms & Inputs
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="py-2.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Data Display
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="py-2.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Feedback & Dialogs
            </TabsTrigger>
            <TabsTrigger
              value="navigation"
              className="py-2.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Navigation
            </TabsTrigger>
          </TabsList>

          {/* ================= GENERAL TAB ================= */}
          <TabsContent value="general" className="space-y-6 outline-none focus:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Buttons & Variants</CardTitle>
                <CardDescription>
                  Core interactive button controls with support for sizes, states, and icons.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variant row */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary (Default)</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link Button</Button>
                  </div>
                </div>

                <Separator />

                {/* Size row */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs">Extra Small (xs)</Button>
                    <Button size="sm">Small (sm)</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large (lg)</Button>
                  </div>
                </div>

                <Separator />

                {/* States row */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">States & Icons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled Button</Button>
                    <Button>
                      <span>Forward Transaction</span>
                      <ArrowRight className="size-4" />
                    </Button>
                    <Button variant="outline">
                      <Plus className="size-4" />
                      <span>Create Listing</span>
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Delete">
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltips & Separators</CardTitle>
                <CardDescription>Helper tooltip indicators and contextual separators.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Hover over this item:</span>
                  <Tooltip>
                    <TooltipTrigger render={
                      <Button variant="outline" size="sm">
                        KYC Requirement Info
                      </Button>
                    } />
                    <TooltipContent className="p-2 text-xs max-w-xs">
                      Mandatory under RBI compliance for business transfers exceeding ₹1,00,000.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Separator />
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div>Direct Bank Transfer</div>
                  <Separator orientation="vertical" />
                  <div>Escrow Wallet</div>
                  <Separator orientation="vertical" />
                  <div>Razorpay UPI</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= FORMS & INPUTS TAB ================= */}
          <TabsContent value="forms" className="space-y-6 outline-none focus:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Input Primitives & Validation</CardTitle>
                <CardDescription>
                  Form input components with labels, descriptions, and error states.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Text Input */}
                  <Field>
                    <FieldLabel htmlFor="pan">Permanent Account Number (PAN)</FieldLabel>
                    <Input id="pan" placeholder="ABCDE1234F" />
                    <FieldDescription>Indian Income Tax Dept issued 10-digit alphanumeric code.</FieldDescription>
                  </Field>

                  {/* Textarea */}
                  <Field>
                    <FieldLabel htmlFor="sale-reason">Reason for Sale</FieldLabel>
                    <Textarea id="sale-reason" placeholder="Describe why you are selling this business..." />
                    <FieldDescription>Provide clear motives to build trust with buyers.</FieldDescription>
                  </Field>

                  {/* Input OTP */}
                  <Field>
                    <FieldLabel>Enter 6-Digit OTP</FieldLabel>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>Sent to Aadhaar registered mobile number.</FieldDescription>
                  </Field>
                </div>

                <div className="space-y-4">
                  {/* Select Dropdown */}
                  <Field>
                    <FieldLabel>Business Industry</FieldLabel>
                    <Select value={selectVal} onValueChange={(val) => setSelectVal(val || "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select industry classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS / Software</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce Store</SelectItem>
                        <SelectItem value="fintech">Fintech Product</SelectItem>
                        <SelectItem value="agency">Services & Agency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Helps buyers filter listings on the marketplace.</FieldDescription>
                  </Field>

                  {/* Input with validation error */}
                  <Field data-invalid="true">
                    <FieldLabel htmlFor="gstin" className="text-destructive">
                      GST Identification Number (GSTIN)
                    </FieldLabel>
                    <Input id="gstin" placeholder="22AAAAA1111A1Z1" className="border-destructive focus-visible:ring-destructive/30" />
                    <FieldError>Please enter a valid GSTIN format (e.g. 22AAAAA1111A1Z1)</FieldError>
                  </Field>

                  {/* Switch */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="nda-toggle" className="text-sm font-semibold">
                        Gated behind NDA
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Require buyers to sign a legal non-disclosure agreement.
                      </p>
                    </div>
                    <Switch id="nda-toggle" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Switches, Checkboxes & Radio Groups</CardTitle>
                <CardDescription>Selection components for forms.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Checkbox Group</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox id="cb-poa" defaultChecked />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="cb-poa"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Verify Proof of Funds (PoF)
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Only buyers with verified capital will be shown financials.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox id="cb-tnc" />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="cb-tnc"
                          className="text-sm font-medium leading-none"
                        >
                          Accept platform fee of 2.5% on deal closure.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Radio Group</h4>
                  <RadioGroup defaultValue="individual">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="individual" id="r-ind" />
                      <div className="grid gap-1.5 leading-none -mt-0.5">
                        <Label htmlFor="r-ind" className="text-sm font-semibold">
                          Individual Account
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          KYC with PAN, Aadhaar and Selfie matching.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                      <RadioGroupItem value="company" id="r-comp" />
                      <div className="grid gap-1.5 leading-none -mt-0.5">
                        <Label htmlFor="r-comp" className="text-sm font-semibold">
                          Company / Institutional Account
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Verify Corporate Registration (CIN), GSTIN & Corporate Bank Accounts.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= DATA DISPLAY TAB ================= */}
          <TabsContent value="display" className="space-y-6 outline-none focus:ring-0">
            {/* Metrics cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Gross Listing Value"
                value="₹24.8 Cr"
                trend={{ value: 18.2, label: "vs last Qtr", isPositive: true }}
                icon={Briefcase}
                chartData={[{ value: 10 }, { value: 12 }, { value: 11 }, { value: 15 }, { value: 18 }, { value: 24 }]}
                chartColor="hsl(var(--primary))"
              />
              <MetricsCard
                title="Active Escrows"
                value="₹1.45 Cr"
                trend={{ value: 5.6, label: "vs last month", isPositive: true }}
                icon={DollarSign}
                chartData={[{ value: 80 }, { value: 90 }, { value: 85 }, { value: 110 }, { value: 130 }, { value: 145 }]}
                chartColor="hsl(var(--primary))"
              />
              <MetricsCard
                title="Verified Acquirers"
                value="2,480"
                trend={{ value: 3.4, label: "vs last week", isPositive: false }}
                icon={Users}
                chartData={[{ value: 2500 }, { value: 2490 }, { value: 2470 }, { value: 2485 }, { value: 2480 }, { value: 2480 }]}
                chartColor="oklch(0.577 0.245 27.325)"
              />
              <MetricsCard
                title="KYC Approval Rate"
                value="94.2%"
                description="Avg. review response under 3 hrs"
                icon={Layers}
              />
            </div>

            {/* Recharts Graphical Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>
                  Aggregated statistics showing growth of verified buyers and sellers (Monthly).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="buyers"
                        stroke="var(--color-buyers)"
                        fill="var(--color-buyers)"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="sellers"
                        stroke="var(--color-sellers)"
                        fill="var(--color-sellers)"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tables & Skeletons */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Marketplace Directory</CardTitle>
                  <CardDescription>Mock representations of Indian businesses active for buyout.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Listing</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Asking Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Mumbai Fintech Platform</TableCell>
                        <TableCell>SaaS</TableCell>
                        <TableCell>₹1.8 Crore</TableCell>
                        <TableCell>
                          <Badge variant="default">Approved</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Bangalore D2C Coffee Brand</TableCell>
                        <TableCell>E-commerce</TableCell>
                        <TableCell>₹85 Lakhs</TableCell>
                        <TableCell>
                          <Badge variant="outline">In Review</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Chennai Logistics App</TableCell>
                        <TableCell>Mobile App</TableCell>
                        <TableCell>₹2.4 Crore</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Sold</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Skeletons Loading Simulation */}
              <Card>
                <CardHeader>
                  <CardTitle>Skeletons & Badges</CardTitle>
                  <CardDescription>Visual structures rendered during layout hydration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Badges preview */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Status Badges
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Verified</Badge>
                      <Badge variant="secondary">In Progress</Badge>
                      <Badge variant="destructive">Rejected</Badge>
                      <Badge variant="outline">Unsubmitted</Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Skeletons preview */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Skeletons
                    </h4>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empty State Component */}
            <Card>
              <CardHeader>
                <CardTitle>Empty State Layout</CardTitle>
                <CardDescription>Fallback card illustrated when no search result fits queries.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No Listings Found"
                  description="We couldn't find any Indian tech listings matching your filters. Try widening budget range or industry options."
                  icon={Search}
                  action={{
                    label: "Clear All Filters",
                    onClick: () => toast.info("Filters cleared!"),
                  }}
                  secondaryAction={{
                    label: "Request Custom Sourcing",
                    onClick: () => toast.info("Custom sourcing form opened!"),
                  }}
                  card
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= FEEDBACK & DIALOGS TAB ================= */}
          <TabsContent value="feedback" className="space-y-6 outline-none focus:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Alerts & Info Panels</CardTitle>
                <CardDescription>Banner layouts notifying users of operational warnings/success.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Escrow Account Initialized</AlertTitle>
                  <AlertDescription>
                    Your contract has been linked to the platform ICICI escrow account. Please transfer funds to the virtual ledger within 48 hours.
                  </AlertDescription>
                </Alert>

                <Alert className="border-destructive/50 bg-destructive/5 text-destructive [&>svg]:text-destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>KYC Verification Pending</AlertTitle>
                  <AlertDescription>
                    Your uploaded PAN card scan is blurry. Please upload a clear photo or perform instant e-KYC using DigiLocker to start receiving buyer proposals.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modals & Overlays</CardTitle>
                <CardDescription>Overlaid sheets and modal confirmations.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {/* Standard Dialog */}
                <Dialog>
                  <DialogTrigger render={
                    <Button>Open Buyer Bid Modal</Button>
                  } />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make Acquisition Proposal</DialogTitle>
                      <DialogDescription>
                        You are submitting a formal offer for Mumbai Fintech Platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      <Field>
                        <FieldLabel htmlFor="bid-amt">Acquisition Value (INR)</FieldLabel>
                        <Input id="bid-amt" placeholder="₹1,80,00,000" />
                        <FieldDescription>Offer value including upfront cash + earnout.</FieldDescription>
                      </Field>
                      <div className="flex items-center gap-2">
                        <Checkbox id="cb-modal-pof" />
                        <Label htmlFor="cb-modal-pof">Attach Proof of Funds</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose render={
                        <Button variant="outline">Cancel</Button>
                      } />
                      <Button onClick={() => toast.success("Acquisition proposal sent!")}>Submit Offer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Inline loading state container loader */}
                <div className="relative border border-border p-4 rounded-lg flex items-center justify-center min-w-[200px] h-[100px]">
                  <LoadingState isLoading={true} text="Verifying documents..." overlay />
                  <div className="text-xs">This content is hidden by overlay loader</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= NAVIGATION TAB ================= */}
          <TabsContent value="navigation" className="space-y-6 outline-none focus:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Multistep Wizard (Stepper)</CardTitle>
                <CardDescription>
                  Displays linear progress through wizards (KYC, Listing setups).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Stepper Display */}
                <Stepper steps={steps} activeStep={activeStep} orientation="horizontal" size="md" />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                  >
                    Previous Step
                  </Button>
                  <Button
                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    disabled={activeStep === steps.length - 1}
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagination & Breadcrumbs</CardTitle>
                <CardDescription>Controls to traverse pages and directory locations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Breadcrumbs */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Breadcrumbs</h4>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">FMI Marketplace</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">listings</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Mumbai Fintech Platform</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <Separator />

                {/* Pagination */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pagination</h4>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
