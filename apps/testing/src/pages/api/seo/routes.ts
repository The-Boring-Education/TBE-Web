/**
 * SEO Routes API
 *
 * GET /api/seo/routes - Get all registered SEO routes from the registry
 * GET /api/seo/routes?app=platform - Get routes for specific app
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
    SEO_REGISTRY,
    type AppSEOConfig
} from '@tbe/constants';

interface RoutesResponse {
    success: boolean;
    data?: {
        apps: Array<{
            appId: string;
            domain: string;
            routeCount: number;
            routes: Array<{
                path: string;
                priority: number;
                changefreq: string;
                isDynamic: boolean;
                description?: string;
            }>;
        }>;
    };
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RoutesResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { app } = req.query;

    try {
        const apps = Object.entries(SEO_REGISTRY)
            .filter(([appId]) => {
                // Skip onboarding as it's not indexed
                if (appId === 'onboarding') return false;
                // Filter by app if specified
                if (app && typeof app === 'string') {
                    return appId === app;
                }
                return true;
            })
            .map(([appId, config]: [string, AppSEOConfig]) => ({
                appId,
                domain: config.domain,
                routeCount: config.publicRoutes.length,
                routes: config.publicRoutes.map((route) => ({
                    path: route.path,
                    priority: route.priority,
                    changefreq: route.changefreq,
                    isDynamic: route.isDynamic || false,
                    description: route.description
                }))
            }));

        return res.status(200).json({
            success: true,
            data: { apps }
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch routes'
        });
    }
}

