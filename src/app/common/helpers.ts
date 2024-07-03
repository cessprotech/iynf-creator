import { BadRequestException, ForbiddenException, UseInterceptors, applyDecorators } from "@nestjs/common";
import { addDays, addHours, compareAsc, format, isValid } from "date-fns";
import { PaginateOptions } from "mongoose";
import { DeepPartial } from "ts-essentials";
import { z } from "zod";
import { MSInterceptor } from "./interceptors";

interface PopulateInterface {
    path: string;
    match?: Record<string, unknown>;
    options?: Record<string, unknown>;
}

export type PopulateOptions = PopulateInterface[] | undefined;

interface CustomPopulateInterface {
    path: string;
    select?: string[];
    as?: string;
    match?: Record<string, any>;
    populate?: Record<string, any>[]
    // where 1 means unwind as object
    // where 2 means unwind fields inside parent object
    unwindType?: number | 1 | 2
    sortPopulate?: string;
    // options?: {
    // [key: string]: any,
        
    // }
}

export type CustomPopulateOptions = CustomPopulateInterface | undefined;

export const transformValues = (obj: Record<string, any>) => {
    const transformedObj = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
  
        if (typeof value === 'string') {
          if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }
        } else if (isObject(value)) {
          value = transformValues(value);
        }
  
        transformedObj[key] = value;
      }
    }
  
    return transformedObj;
  }

export const QueryOptions = (query: Record<string, unknown>, lean=false): {
    otherQuery: Record<string, any>,
    paginateOptions: PaginateOptions
} => {
    const { page, limit, select, sort, ...rest }: PaginateOptions = query;

    const paginateOptions: PaginateOptions = {
        page: +page || 1,
        limit: +limit || 10,
        select: select || '',
        sort: sort ? `${sort},-createdAt` : '-createdAt',
        populate: [],
        lean
    }

    let transformed = transformValues(rest);

    return { otherQuery: transformed as unknown as Record<string, any>, paginateOptions }
}

export const BaseResponses = (resource: string) => {
    return {
        DEFAULT: 'Data fetch Successful.',
        FIND_ALL: `${resource}s Data Fetch Successful.`,
        FIND_ONE_BY_ID: `${resource} Data Fetch Successful.`,
        DELETE: `${resource} Deleted Successully.`,
        CREATE: `${resource} Created Successfully.`,
        UPDATE: `${resource} Updated Successfully.`,
    }
}

export const DateFormatString = 'PPPPpppp'

interface IteratorIF<T> {
    length: number;
}

export const MapArrToObject = <T>(data: T & IteratorIF<T>) => {
    let obj: Record<string, unknown>;

    for (let i = 0; i < data.length; i++) obj[data[i]] = data[i];
    
    return obj;
}

export const MapKeysToValues = <T>(obj: T) => {
    return Object.keys(obj).reduce(
		function (
			obj,
			key,
		) {
			obj[key] = key;
			return obj;
		},
	{}) as unknown as Record<keyof T, string>;
}

export const isObject = (value: any) => {
  return typeof value === 'object' && value !== null && typeof value !== 'function' && !(Array.isArray(value));
}

export interface ZodRequired<T extends z.ZodType<any>> {
    new (): Required<z.infer<T>>;
}

export const MSController = () => {
    return applyDecorators(
      UseInterceptors(MSInterceptor),
    );
};
