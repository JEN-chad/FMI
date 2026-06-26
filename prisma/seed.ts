import "dotenv/config";
import { Role, KycStatus, KycType, AssetType, PricingModel, ListingStatus, DocumentType, NdaStatus, OfferStatus, DealStage, EscrowStatus, ChecklistItemAssignee, PaymentPurpose, PaymentStatus, ReviewRole, InvestorType, ExperienceLevel } from "@prisma/client";
import { prisma } from "../lib/db/prisma";

async function main() {
  console.log("Cleaning database...");
  // Delete in reverse order of relationships
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.dealChecklistItem.deleteMany();
  await prisma.dealDocument.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.ndaAgreement.deleteMany();
  await prisma.listingDocument.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.kycProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding base users...");

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Jenish (Admin)",
      email: "admin@zuntra.in",
      emailVerified: true,
      role: Role.ADMIN,
      kycStatus: KycStatus.APPROVED,
    },
  });

  // 2. Create Seller
  const seller = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav@seller.in",
      emailVerified: true,
      phone: "+919876543210",
      phoneVerified: true,
      role: Role.SELLER,
      kycStatus: KycStatus.APPROVED,
      kycType: KycType.COMPANY,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    },
  });

  // 3. Create Buyer
  const buyer = await prisma.user.create({
    data: {
      name: "Vikram Malhotra",
      email: "vikram@buyer.in",
      emailVerified: true,
      phone: "+919811223344",
      phoneVerified: true,
      role: Role.BUYER,
      kycStatus: KycStatus.APPROVED,
      kycType: KycType.INDIVIDUAL,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    },
  });

  // 4. Create Unverified User
  await prisma.user.create({
    data: {
      name: "Rohit Patel",
      email: "rohit@unverified.in",
      emailVerified: true,
      role: Role.BUYER,
      kycStatus: KycStatus.NOT_STARTED,
    },
  });

  console.log("Seeding KYC Profiles...");

  // Seller Company KYC
  await prisma.kycProfile.create({
    data: {
      userId: seller.id,
      panNumber: "ABCDE1234F",
      aadhaarLast4: "5678",
      panDocUrl: "https://cloudinary.com/docs/pan_placeholder.jpg",
      aadhaarDocUrl: "https://cloudinary.com/docs/aadhaar_placeholder.jpg",
      selfieUrl: "https://cloudinary.com/docs/selfie_seller.jpg",
      bankAccountName: "Sharma Tech Solutions Pvt Ltd",
      bankAccountNumber: "123456789012",
      bankIfsc: "HDFC0001234",
      companyName: "Sharma Tech Solutions Pvt Ltd",
      cin: "U72200MH2021PTC354321",
      gstin: "27ABCDE1234F1Z5",
      companyPan: "ABCDE1234F",
      directorName: "Aarav Sharma",
      status: KycStatus.APPROVED,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  // Buyer Individual KYC
  await prisma.kycProfile.create({
    data: {
      userId: buyer.id,
      panNumber: "PQRST9876Z",
      aadhaarLast4: "1234",
      panDocUrl: "https://cloudinary.com/docs/pan_buyer.jpg",
      aadhaarDocUrl: "https://cloudinary.com/docs/aadhaar_buyer.jpg",
      selfieUrl: "https://cloudinary.com/docs/selfie_buyer.jpg",
      bankAccountName: "Vikram Malhotra",
      bankAccountNumber: "987654321098",
      bankIfsc: "ICIC0000001",
      status: KycStatus.APPROVED,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  console.log("Seeding Buyer Profile...");
  await prisma.buyerProfile.create({
    data: {
      userId: buyer.id,
      investorType: InvestorType.FAMILY_OFFICE,
      industries: ["saas", "ecommerce"],
      states: ["Maharashtra", "Karnataka", "Delhi"],
      budgetMin: 500000,
      budgetMax: 5000000,
      acquisitionGoal: "Acquiring cash-flowing Indian B2B SaaS businesses with high retention.",
      experienceLevel: ExperienceLevel.EXPERIENCED,
      proofOfFundsVerified: true,
    },
  });

  console.log("Seeding Listings...");

  // 1. Live SaaS Listing
  const saasListing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      slug: "invoice-fast-indian-saas",
      title: "InvoiceFast — B2B Billing SaaS for Indian SMEs",
      businessNamePrivate: "InvoiceFast Tech LLP",
      assetType: AssetType.SAAS,
      industry: "FinTech",
      businessModel: "SaaS Subscription",
      yearEstablished: 2022,
      businessUrl: "https://invoicefast.in",
      monthlyRevenue: 150000,
      monthlyProfit: 120000,
      monthlyTraffic: 25000,
      trafficSources: "SEO (70%), Direct (20%), Referral (10%)",
      askingPrice: 3500000,
      reasonForSale: "Founder starting a new venture in AI space.",
      description: "InvoiceFast is a simplified billing and e-invoicing SaaS designed specifically for Indian GST compliance. It has over 450 active paid businesses using the platform monthly. Excellent margins and automated server overheads.",
      tagline: "E-invoicing and GST billing platform with ₹1.2L Monthly Profit",
      teamSize: 1,
      hoursPerWeek: 5,
      pricingModel: PricingModel.CLASSIFIED,
      status: ListingStatus.LIVE,
      ndaRequired: true,
      ndaFee: 500, // ₹500 unlock fee
      isFeatured: true,
      tags: ["fintech", "saas", "gst", "billing"],
      viewCount: 1420,
      publishedAt: new Date(),
    },
  });

  // 2. Live eCommerce Listing
  await prisma.listing.create({
    data: {
      sellerId: seller.id,
      slug: "khadi-organic-cosmetics",
      title: "Organic Khadi Care — D2C Skincare Brand",
      businessNamePrivate: "Organic Khadi Care Private Limited",
      assetType: AssetType.ECOMMERCE,
      industry: "Beauty & Personal Care",
      businessModel: "eCommerce D2C",
      yearEstablished: 2021,
      businessUrl: "https://organickhadicare.com",
      monthlyRevenue: 800000,
      monthlyProfit: 180000,
      monthlyTraffic: 90000,
      trafficSources: "Meta Ads (60%), Instagram Organic (30%), Search (10%)",
      askingPrice: 4500000,
      reasonForSale: "Partner conflict and lack of capital to scale inventory.",
      description: "Organic Khadi Care is a verified natural skincare D2C brand sourcing directly from organic cooperatives in Uttar Pradesh and Uttarakhand. 18% repeat customer rate and clean supply chain logs.",
      tagline: "High-Margin D2C Brand doing ₹8L/mo Revenue",
      teamSize: 3,
      hoursPerWeek: 20,
      pricingModel: PricingModel.CLASSIFIED,
      status: ListingStatus.LIVE,
      ndaRequired: false,
      ndaFee: 0,
      tags: ["d2c", "ecommerce", "organic", "beauty"],
      viewCount: 890,
      publishedAt: new Date(),
    },
  });

  // 3. Draft Listing
  await prisma.listing.create({
    data: {
      sellerId: seller.id,
      slug: "dev-resource-hub-blog",
      title: "DevJobsIndia — Developer Resource Directory",
      assetType: AssetType.BLOG,
      industry: "Jobs & Careers",
      askingPrice: 80000,
      status: ListingStatus.DRAFT,
      ndaRequired: true,
      ndaFee: 0,
    },
  });

  console.log("Seeding Listing Documents...");
  await prisma.listingDocument.create({
    data: {
      listingId: saasListing.id,
      type: DocumentType.FINANCIAL,
      name: "FY24-Profit-Loss-Statement.pdf",
      url: "https://cloudinary.com/docs/financial_saas.pdf",
      isPrivate: true,
    },
  });

  await prisma.listingDocument.create({
    data: {
      listingId: saasListing.id,
      type: DocumentType.ANALYTICS,
      name: "Google-Analytics-Report-May24.pdf",
      url: "https://cloudinary.com/docs/analytics_saas.pdf",
      isPrivate: false, // Public document
    },
  });

  console.log("Seeding Payments, NDAs, and Deals...");

  // 1. Buyer pays NDA unlock fee for SaaS Listing
  const ndaPayment = await prisma.payment.create({
    data: {
      userId: buyer.id,
      listingId: saasListing.id,
      purpose: PaymentPurpose.NDA_FEE,
      amount: 500,
      currency: "INR",
      providerOrderId: "order_mock_nda_101",
      providerPaymentId: "pay_mock_nda_101",
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  // 2. NDA Signed by Buyer
  await prisma.ndaAgreement.create({
    data: {
      listingId: saasListing.id,
      buyerId: buyer.id,
      status: NdaStatus.SIGNED,
      signedAt: new Date(),
      paymentId: ndaPayment.id,
      feePaid: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Buyer makes Offer on SaaS Listing
  const offer = await prisma.offer.create({
    data: {
      listingId: saasListing.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 3200000, // Asking was 35L, Buyer offers 32L
      upfrontPercent: 80,
      earnoutPercent: 20,
      earnoutTerms: "20% paid out over 12 months conditional on traffic maintaining a minimum of 20k visits/mo.",
      message: "Strong cash offer, ready to close immediately upon P&L audit.",
      status: OfferStatus.ACCEPTED,
    },
  });

  // 4. Offer accepted → creates Deal
  const deal = await prisma.deal.create({
    data: {
      listingId: saasListing.id,
      offerId: offer.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      stage: DealStage.DUE_DILIGENCE,
      dealValue: 3200000,
      escrowStatus: EscrowStatus.PENDING,
    },
  });

  // Pause listing since deal is active
  await prisma.listing.update({
    where: { id: saasListing.id },
    data: { status: ListingStatus.PAUSED },
  });

  // Create checklist items for the deal
  const checklistItems = [
    {
      dealId: deal.id,
      title: "Verify Proof of Funds",
      description: "Buyer must upload Proof of Funds (POF) for admin verification",
      assignedTo: ChecklistItemAssignee.BUYER,
      isCompleted: true,
      completedBy: buyer.id,
      completedAt: new Date(),
      sortOrder: 1,
    },
    {
      dealId: deal.id,
      title: "Initiate Escrow Setup",
      description: "Set up the Razorpay/Escrow payment process for the upfront value",
      assignedTo: ChecklistItemAssignee.PLATFORM,
      isCompleted: false,
      sortOrder: 2,
    },
    {
      dealId: deal.id,
      title: "Submit Due Diligence Documents",
      description: "Seller must upload verified profit/loss statements and traffic stats",
      assignedTo: ChecklistItemAssignee.SELLER,
      isCompleted: false,
      sortOrder: 3,
    },
  ];

  for (const item of checklistItems) {
    await prisma.dealChecklistItem.create({ data: item });
  }

  console.log("Seeding Messages inside Deal Room...");
  await prisma.message.create({
    data: {
      dealId: deal.id,
      senderId: buyer.id,
      content: "Hello Aarav, I have uploaded my bank statement as proof of funds. Excited to complete due diligence.",
    },
  });

  await prisma.message.create({
    data: {
      dealId: deal.id,
      senderId: seller.id,
      content: "Thank you Vikram. I am preparing the fresh stripe logs and server hosting analytics to share with you here.",
    },
  });

  console.log("Seeding Notifications...");
  await prisma.notification.create({
    data: {
      userId: seller.id,
      type: "DEAL_INITIATED",
      title: "New Deal Room Opened",
      body: "Offer accepted on 'InvoiceFast'. Deal Room is now active.",
      data: { dealId: deal.id },
    },
  });

  console.log("Seeding closed transaction with Review...");
  
  // Create a fake sold listing
  const soldListing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      slug: "old-agency-business",
      title: "Digital Marketing Agency doing Web dev",
      assetType: AssetType.SERVICE,
      industry: "Marketing",
      askingPrice: 1200000,
      status: ListingStatus.SOLD,
      ndaRequired: false,
    },
  });

  const acceptedOffer = await prisma.offer.create({
    data: {
      listingId: soldListing.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 1100000,
      status: OfferStatus.ACCEPTED,
    },
  });

  const closedDeal = await prisma.deal.create({
    data: {
      listingId: soldListing.id,
      offerId: acceptedOffer.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      stage: DealStage.CLOSED,
      dealValue: 1100000,
      escrowStatus: EscrowStatus.RELEASED,
      buyerSigned: true,
      sellerSigned: true,
      signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      closedAt: new Date(),
    },
  });

  // Buyer leaves review for Seller
  await prisma.review.create({
    data: {
      dealId: closedDeal.id,
      reviewerId: buyer.id,
      revieweeId: seller.id,
      role: ReviewRole.BUYER,
      rating: 5,
      comment: "Aarav was extremely helpful during the handover of the domains and server access. Solid business!",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
