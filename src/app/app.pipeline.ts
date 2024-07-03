import { Model, PopulateOptions, PaginateOptions } from "mongoose";
import { AggregateQueryMethods, customPaginate } from "./common/pipeline.helper";
import { CustomPopulateOptions } from "./common/helpers";


export function AppPipeline<T>(model: Model<T>) {
    return {
        getAll: async (query: Record<string, any>, paginateOptions?: PaginateOptions) => {
            const { filteredQuery, pipeline } = GetAllPipeline(query, paginateOptions);

            return await customPaginate(model, pipeline, filteredQuery, paginateOptions);
        },

        getOne: async (query: Record<string, any>, populateOptions?: CustomPopulateOptions[]) => {
            const pipeline = GetOnePipeline(query, populateOptions);

            const [result] = await model.aggregate(pipeline);

            return result;
        },
    }
}

export const GetOnePipeline = (query: Record<string, any>, populateOptions?: CustomPopulateOptions[]) => {
    const pipeline: any[] = [
        {
            $match: AggregateQueryMethods.filter(query)
        }
    ]

    if (Array.isArray(populateOptions)) {
        populateOptions.forEach((option: CustomPopulateOptions) => {
            pipeline.push(...AggregateQueryMethods.populate(option))
        })
    }

    return pipeline;
}

export const GetAllPipeline = (query: Record<string, any>, paginateOptions?: PaginateOptions) => {
    const filteredQuery = AggregateQueryMethods.filter(query);

    const pipeline: any[] = [
        {
            $match: filteredQuery
        }
    ]

    if (Array.isArray(paginateOptions.populate)) {
        paginateOptions.populate.forEach((option: CustomPopulateOptions) => {
            console.log(option);
            pipeline.push(...AggregateQueryMethods.populate(option))
        })
    }

    pipeline.push(...[
        {
            $sort: AggregateQueryMethods.sort(paginateOptions.sort)
        },
        ...AggregateQueryMethods.paginate(paginateOptions.page, paginateOptions.limit)
    ])

    return { filteredQuery, pipeline }
}