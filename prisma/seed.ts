import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/hash'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Clean existing data (optional - comment out jika tidak mau reset)
    console.log('🗑️  Cleaning existing data...')
    await prisma.review.deleteMany()
    await prisma.license.deleteMany()
    await prisma.download.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // ============================================
    // USERS (Admin & Customers)
    // ============================================
    console.log('👥 Creating users...')

    const adminPassword = await hashPassword('admin123')
    const customerPassword = await hashPassword('customer123')

    const admin = await prisma.user.create({
        data: {
            email: 'admin@happyshop.com',
            password: adminPassword,
            name: 'Admin HappyShop',
            role: 'admin',
            isEmailVerified: true,
        },
    })



    console.log(`✅ Created ${admin.name} (Admin)`)
    // console.log(`✅ Created ${customer1.name} (Customer)`)
    // console.log(`✅ Created ${customer2.name} (Customer)`)
    // console.log(`✅ Created ${customer3.name} (Customer)`)

    // ============================================
    // CATEGORIES
    // ============================================
    console.log('\n📂 Creating categories...')

    const ebooks = await prisma.category.create({
        data: {
            name: 'E-Books',
            slug: 'ebooks',
            description: 'Digital books and publications',
        },
    })

    const software = await prisma.category.create({
        data: {
            name: 'Software',
            slug: 'software',
            description: 'Software applications and tools',
        },
    })

    const templates = await prisma.category.create({
        data: {
            name: 'Templates',
            slug: 'templates',
            description: 'Ready-to-use templates for design and development',
        },
    })

    const courses = await prisma.category.create({
        data: {
            name: 'Online Courses',
            slug: 'courses',
            description: 'Video courses and educational content',
        },
    })

    console.log(`✅ Created ${ebooks.name}`)
    console.log(`✅ Created ${software.name}`)
    console.log(`✅ Created ${templates.name}`)
    console.log(`✅ Created ${courses.name}`)

    // ============================================
    // PRODUCTS
    // ============================================
    console.log('\n📦 Creating products...')

    const product1 = await prisma.product.create({
        data: {
            categoryId: ebooks.id,
            name: 'Mastering TypeScript - Complete Guide',
            slug: 'mastering-typescript-complete-guide',
            description: 'Learn TypeScript from beginner to advanced. Includes practical examples and real-world projects.',
            price: 99000,
            fileUrl: 'https://storage.example.com/products/typescript-ebook.pdf',
            fileSize: 15728640, // 15 MB
            fileType: 'pdf',
            thumbnailUrl: 'https://storage.example.com/thumbnails/typescript-ebook.jpg',
            requiresLicense: false,
            status: 'PUBLISHED',
            downloadCount: 0,
        },
    })

    const product2 = await prisma.product.create({
        data: {
            categoryId: software.id,
            name: 'Project Management Pro',
            slug: 'project-management-pro',
            description: 'Professional project management software with advanced features. Lifetime license included.',
            price: 499000,
            fileUrl: 'https://storage.example.com/products/pm-pro-setup.exe',
            fileSize: 52428800, // 50 MB
            fileType: 'exe',
            thumbnailUrl: 'https://storage.example.com/thumbnails/pm-pro.jpg',
            requiresLicense: true,
            status: 'PUBLISHED',
            downloadCount: 0,
        },
    })

    const product3 = await prisma.product.create({
        data: {
            categoryId: templates.id,
            name: 'Modern Landing Page Templates Pack',
            slug: 'modern-landing-page-templates',
            description: '10 premium landing page templates built with React and Tailwind CSS.',
            price: 149000,
            fileUrl: 'https://storage.example.com/products/landing-templates.zip',
            fileSize: 20971520, // 20 MB
            fileType: 'zip',
            thumbnailUrl: 'https://storage.example.com/thumbnails/landing-templates.jpg',
            requiresLicense: false,
            status: 'PUBLISHED',
            downloadCount: 0,
        },
    })

    const product4 = await prisma.product.create({
        data: {
            categoryId: courses.id,
            name: 'Full Stack Web Development Bootcamp',
            slug: 'fullstack-web-dev-bootcamp',
            description: 'Complete bootcamp covering HTML, CSS, JavaScript, React, Node.js, and PostgreSQL.',
            price: 799000,
            fileUrl: 'https://storage.example.com/products/bootcamp-videos.zip',
            fileSize: 524288000, // 500 MB (instead of 2 GB to avoid INT4 overflow)
            fileType: 'zip',
            thumbnailUrl: 'https://storage.example.com/thumbnails/bootcamp.jpg',
            requiresLicense: false,
            status: 'PUBLISHED',
            downloadCount: 0,
        },
    })

    const product5 = await prisma.product.create({
        data: {
            categoryId: ebooks.id,
            name: 'Clean Code Practices',
            slug: 'clean-code-practices',
            description: 'Best practices for writing clean, maintainable code.',
            price: 79000,
            fileUrl: 'https://storage.example.com/products/clean-code.pdf',
            fileSize: 10485760, // 10 MB
            fileType: 'pdf',
            thumbnailUrl: 'https://storage.example.com/thumbnails/clean-code.jpg',
            requiresLicense: false,
            status: 'DRAFT',
            downloadCount: 0,
        },
    })

    console.log(`✅ Created ${product1.name}`)
    console.log(`✅ Created ${product2.name}`)
    console.log(`✅ Created ${product3.name}`)
    console.log(`✅ Created ${product4.name}`)
    console.log(`✅ Created ${product5.name}`)

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: 4 (1 Admin, 3 Customers)`)
    console.log(`   - Categories: 4`)
    console.log(`   - Products: 5`)
    console.log('\n🔐 Test Credentials:')
    console.log('   Admin:')
    console.log('     Email: admin@happyshop.com')
    console.log('     Password: admin123')
    console.log('   Customer:')
    console.log('     Email: john.doe@example.com')
    console.log('     Password: customer123')
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
