import { Sequelize, Transaction } from 'sequelize';
import {expect, jest, test, describe, it, afterAll, beforeEach} from '@jest/globals';

/**
 * What do we have to mock to run these tests?
 * - definitely the database
 * - the interfaces with the payment api
 */
jest.mock('sequelize');

const mockSequelize = new Sequelize();

describe('rental manager', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('should start rental', () => {
        it('should start a static rental with valid information', () => {
            
        });

        it('should start a dynamic rental with valid information', () => {
            
        });

        it('should handle invalid information when starting rentals', () => {
            
        });
    });

    describe('should end rental', () => {
        it('should end a static rental', () => {
            
        });

        it('should end a dynamic rental', () => {
            
        });

        it('should handle trying to end a non-existent rental', () => {
            
        });
    });

    it('should schedule rental check', () => {
        
    });

    describe('should check rental', () => {
        it('should extend dynamic rental', () => {
            
        });

        it('should end static rental', () => {
            
        });

        it('should handle trying to extend ended rentals', () => {
            
        });
    });

    describe('should end rental', () => {
        it('should end active rentals', () => {
            
        });

        it('should handle ending past or invalid rentals', () => {
            
        });
    });
});
