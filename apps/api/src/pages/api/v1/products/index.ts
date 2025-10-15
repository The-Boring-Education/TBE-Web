import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
// Import all product models
import {Course, InterviewSheet, Project, Webinar} from '@/lib/database';
import { sendAPIResponse } from '@/lib/utils';
import { cors } from '@/lib/utils';
import { adminMiddleware,connectDB } from '@/middleware';

interface ProductInfo {
  _id: string;
  name: string;
  type: string;
  price?: number;
  isPremium?: boolean;
  isActive?: boolean;
}

interface ProductsResponse {
  interviewSheets: ProductInfo[];
  courses: ProductInfo[];
  projects: ProductInfo[];
  webinars: ProductInfo[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply admin middleware - only admins can access product management
  const adminCheck = await adminMiddleware(req, res);
  if (!adminCheck) return;

  await connectDB();

  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetProducts(res);

    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        })
      );
  }
};

// GET - Get all products grouped by type (admin only)
const handleGetProducts = async (res: NextApiResponse) => {
  try {
    // Fetch all product types in parallel
    const [interviewSheets, courses, projects, webinars] = await Promise.all([
      // Interview Sheets - only premium ones can have coupons
      InterviewSheet.find({ isPremium: true })
        .select('_id name price isPremium isActive')
        .lean(),
      
      // Courses - only premium ones can have coupons
      Course.find({ isPremium: true })
        .select('_id name price isPremium')
        .lean(),
      
      // Projects - all projects can have coupons (assuming they can be premium)
      Project.find({ isActive: true })
        .select('_id name isActive')
        .lean(),
      
      // Webinars - all webinars can have coupons
      Webinar.find({})
        .select('_id name')
        .lean()
    ]);

    const productsResponse: ProductsResponse = {
      interviewSheets: interviewSheets.map(sheet => ({
        _id: sheet._id.toString(),
        name: sheet.name,
        type: 'INTERVIEW_SHEET',
        price: sheet.price,
        isPremium: sheet.isPremium,
        isActive: true // Interview sheets are active if they exist
      })),
      
      courses: courses.map(course => ({
        _id: course._id.toString(),
        name: course.name,
        type: 'SHIKSHA',
        price: course.price,
        isPremium: course.isPremium,
        isActive: true // Courses don't have isActive field, assume active if premium
      })),
      
      projects: projects.map(project => ({
        _id: project._id.toString(),
        name: project.name,
        type: 'PROJECTS',
        isActive: project.isActive
      })),
      
      webinars: webinars.map(webinar => ({
        _id: webinar._id.toString(),
        name: webinar.name,
        type: 'GENERAL', // Webinars fall under general category
        isActive: true
      }))
    };

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Products fetched successfully',
        data: productsResponse,
      })
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error while fetching products',
      })
    );
  }
};

export default handler;
