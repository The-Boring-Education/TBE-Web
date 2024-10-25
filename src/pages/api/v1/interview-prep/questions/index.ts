import { NextApiRequest, NextApiResponse } from 'next';
import { apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import InterviewSheet from '@/database/models/InterviewPrep/Sheet';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleAddQuestion(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleAddQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const {
      name,
      slug,
      description,
      coverImageURL,
      liveOn,
      questions,
      roadmap,
    } = req.body;

    if (!name || !slug || !description || !coverImageURL || !liveOn || !questions || !roadmap) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields',
        })
      );
    }

    const newSheet = new InterviewSheet({
      name,
      slug,
      description,
      coverImageURL,
      liveOn,
      questions,
      roadmap,
    });

    const savedSheet = await newSheet.save();

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Question added successfully',
        data: savedSheet,
      })
    );
  } catch (error) {
    console.error('Error adding question:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'An error occurred while adding the question.',
        error: error.message,
      })
    );
  }
};

export default handler;

