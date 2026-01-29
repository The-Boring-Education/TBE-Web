import { describe, it, expect, vi, beforeEach } from 'vitest';
import { challengesService } from '@tbe/utils/challenges';

// Mock dependencies
vi.mock('@tbe/utils/api', () => ({
    sendRequest: vi.fn(),
}));

vi.mock('@tbe/utils/analytics', () => ({
    trackEvent: vi.fn(),
}));

import { sendRequest } from '@tbe/utils/api';
import { trackEvent } from '@tbe/utils/analytics';

const mockSendRequest = vi.mocked(sendRequest);
const mockTrackEvent = vi.mocked(trackEvent);

describe('Challenges Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('challengesService.getByUserId', () => {
        it('should fetch challenges for user', async () => {
            const mockChallenges = [
                { _id: '1', name: 'Challenge 1', userId: 'user-123' },
                { _id: '2', name: 'Challenge 2', userId: 'user-123' },
            ];
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockChallenges,
            });

            const result = await challengesService.getByUserId('user-123');

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges?userId=user-123',
                method: 'GET',
            });
            expect(result).toEqual(mockChallenges);
        });

        it('should return empty array when no data', async () => {
            mockSendRequest.mockResolvedValue({
                success: true,
                data: null,
            });

            const result = await challengesService.getByUserId('user-123');

            expect(result).toEqual([]);
        });

        it('should throw error when request fails', async () => {
            mockSendRequest.mockResolvedValue({
                success: false,
            });

            await expect(challengesService.getByUserId('user-123')).rejects.toThrow(
                'Failed to fetch challenges'
            );
        });
    });

    describe('challengesService.create', () => {
        it('should create challenge successfully', async () => {
            const challengeData = {
                name: '30 Day Challenge',
                totalDays: 30,
                category: 'coding',
                user: 'user-123',
            };
            const mockChallenge = { _id: 'challenge-123', ...challengeData };
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockChallenge,
            });

            const result = await challengesService.create(challengeData);

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges',
                method: 'POST',
                body: challengeData,
            });
            expect(result).toEqual(mockChallenge);
            expect(mockTrackEvent).toHaveBeenCalledWith('challenge_create', {
                category: 'challenge',
                value: 30,
                challengeName: '30 Day Challenge',
                challengeCategory: 'coding',
            });
        });

        it('should handle tracking errors gracefully', async () => {
            mockSendRequest.mockResolvedValue({
                success: true,
                data: { _id: 'challenge-123' },
            });
            mockTrackEvent.mockImplementation(() => {
                throw new Error('Tracking error');
            });

            const result = await challengesService.create({
                name: 'Test',
                totalDays: 7,
                category: 'coding',
                user: 'user-123',
            });

            // Should still return result even if tracking fails
            expect(result).toBeDefined();
        });
    });

    describe('challengesService.update', () => {
        it('should update challenge successfully', async () => {
            const updateData = {
                challengeId: 'challenge-123',
                name: 'Updated Challenge',
                totalDays: 45,
                category: 'coding',
                isActive: true,
            };
            const mockUpdated = { _id: 'challenge-123', ...updateData };
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockUpdated,
            });

            const result = await challengesService.update(updateData);

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges/challenge-123',
                method: 'PUT',
                body: {
                    name: 'Updated Challenge',
                    totalDays: 45,
                    category: 'coding',
                    isActive: true,
                },
            });
            expect(result).toEqual(mockUpdated);
            expect(mockTrackEvent).toHaveBeenCalled();
        });
    });

    describe('challengesService.delete', () => {
        it('should delete challenge successfully', async () => {
            mockSendRequest.mockResolvedValue({
                success: true,
            });

            await challengesService.delete('challenge-123');

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges/challenge-123',
                method: 'DELETE',
            });
            expect(mockTrackEvent).toHaveBeenCalledWith('challenge_delete', {
                category: 'challenge',
                challengeId: 'challenge-123',
            });
        });
    });

    describe('challengesService.getLogs', () => {
        it('should fetch challenge logs', async () => {
            const mockLogs = [
                { _id: 'log-1', day: 1, progressText: 'Day 1 progress' },
                { _id: 'log-2', day: 2, progressText: 'Day 2 progress' },
            ];
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockLogs,
            });

            const result = await challengesService.getLogs('challenge-123');

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges/challenge-123/logs',
                method: 'GET',
            });
            expect(result).toEqual(mockLogs);
        });
    });

    describe('challengesService.createLog', () => {
        it('should create challenge log successfully', async () => {
            const logData = {
                challengeId: 'challenge-123',
                day: 5,
                hoursSpent: 2,
                progressText: 'Made good progress',
                nextGoals: ['Complete module 2'],
            };
            const mockLog = { _id: 'log-123', ...logData };
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockLog,
            });

            const result = await challengesService.createLog(logData);

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges/challenge-123/logs',
                method: 'POST',
                body: logData,
            });
            expect(result).toEqual(mockLog);
            expect(mockTrackEvent).toHaveBeenCalledWith('challenge_log_create', {
                category: 'challenge',
                challengeId: 'challenge-123',
                day: 5,
                hoursSpent: 2,
            });
        });
    });

    describe('challengesService.getProgress', () => {
        it('should fetch challenge progress', async () => {
            const mockProgress = {
                challengeId: 'challenge-123',
                totalDays: 30,
                completedDays: 10,
                progressPercentage: 33.33,
            };
            mockSendRequest.mockResolvedValue({
                success: true,
                data: mockProgress,
            });

            const result = await challengesService.getProgress('challenge-123');

            expect(mockSendRequest).toHaveBeenCalledWith({
                url: '/prepyatra/challenges/challenge-123/progress',
                method: 'GET',
            });
            expect(result).toEqual(mockProgress);
        });
    });

    describe('challengesService.generateSocialMediaTemplate', () => {
        it('should generate social media template', () => {
            const challenge = {
                _id: 'challenge-123',
                name: '30 Day Coding Challenge',
            } as any;
            const currentLog = {
                day: 10,
                progressText: 'Completed React basics',
                nextGoals: ['Learn hooks', 'Build a project'],
            } as any;

            const template = challengesService.generateSocialMediaTemplate(
                challenge,
                currentLog
            );

            expect(template.challengeName).toBe('30 Day Coding Challenge');
            expect(template.currentDay).toBe(10);
            expect(template.progressText).toBe('Completed React basics');
            expect(template.nextGoals).toEqual(['Learn hooks', 'Build a project']);
            expect(template.appUrl).toBeDefined();
        });

        it('should use provided nextGoals over log goals', () => {
            const challenge = { _id: 'challenge-123', name: 'Challenge' } as any;
            const currentLog = {
                day: 5,
                progressText: 'Progress',
                nextGoals: ['Goal 1'],
            } as any;
            const customGoals = ['Custom Goal 1', 'Custom Goal 2'];

            const template = challengesService.generateSocialMediaTemplate(
                challenge,
                currentLog,
                customGoals
            );

            expect(template.nextGoals).toEqual(customGoals);
        });
    });

    describe('challengesService.formatSocialMediaMessage', () => {
        it('should format social media message correctly', () => {
            const template = {
                challengeName: '30 Day Coding Challenge',
                currentDay: 10,
                progressText: 'Completed React basics',
                nextGoals: ['Learn hooks', 'Build a project'],
                appUrl: 'https://prepyatra.example.com',
            };

            const message = challengesService.formatSocialMediaMessage(template);

            expect(message).toContain('Day 10');
            expect(message).toContain('30 Day Coding Challenge');
            expect(message).toContain('Completed React basics');
            expect(message).toContain('1. Learn hooks');
            expect(message).toContain('2. Build a project');
            expect(message).toContain('https://prepyatra.example.com');
        });

        it('should handle empty nextGoals', () => {
            const template = {
                challengeName: 'Challenge',
                currentDay: 1,
                progressText: 'Progress',
                nextGoals: [],
                appUrl: 'https://example.com',
            };

            const message = challengesService.formatSocialMediaMessage(template);

            expect(message).toContain('My next goal is -');
            expect(message).not.toContain('1.');
        });
    });
});
