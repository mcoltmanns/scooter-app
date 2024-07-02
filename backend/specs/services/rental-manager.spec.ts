import { Sequelize, Transaction } from 'sequelize';
import {expect, jest, test, describe, it, afterAll, beforeEach} from '@jest/globals';

jest.mock('sequelize');

const mockSequelize = new Sequelize();

describe('rental manager', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('should start rental', () => {
        it('should start a static rental with valid information', () => {
            expect(true);
        });

        it('should start a dynamic rental with valid information', () => {
            expect(true);
        });

        it('should handle invalid information when starting rentals', () => {
            expect(true);
        });
    });

    describe('should end rental', () => {
        it('should end a static rental', () => {
            expect(true);
        });

        it('should end a dynamic rental', () => {
            expect(true);
        });

        it('should handle trying to end a non-existent rental', () => {
            expect(true);
        });
    });

    it('should schedule rental check', () => {
        expect(true);
    });

    describe('should check rental', () => {
        it('should extend dynamic rental', () => {
            expect(true);
        });

        it('should end static rental', () => {
            expect(true);
        });

        it('should handle trying to extend ended rentals', () => {
            expect(true);
        });
    });

    describe('should end rental', () => {
        it('should end active rentals', () => {
            expect(true);
        });

        it('should handle ending past or invalid rentals', () => {
            expect(true);
        });
    });
});
