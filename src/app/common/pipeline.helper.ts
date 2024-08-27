import { Model, PaginateOptions, PipelineStage, PopulateOptions } from "mongoose";
import { CustomPopulateOptions } from "./helpers";

const lookups = {
    user: {
        from: 'users',
        localField: 'userId',
        foreignField: 'userId',
    },

    creator: {
        from: 'creators',
        localField: 'creatorId',
        foreignField: 'creatorId',
    },

    influencer: {
        from: 'influencers',
        localField: 'influencerId',
        foreignField: 'influencerId',
    },

    bidsCount: {
        from: 'bids',
        localField: 'jobId',
        foreignField: 'jobId',
        count: true,
    },

    review: {
        from: 'reviews',
        localField: 'jobId',
        foreignField: 'jobId',
    },
}

export const AggregateQueryMethods = {
    filter(data: Record<string, any>) {
        let updatedData: Record<string, any> = {};
        if (Object.keys(data).length !== 0) {
            const queryObj = { ...data };
            const excludeObj = ['page', 'sort', 'limit', 'select', 'search'];

            // REMOVE THE KEYS IN excludeObj from queryObj
            excludeObj.forEach((el) => delete queryObj[el]);

            // CHANGE (lt, gt, lte, gte) to ($lt, $gt, $lte, $gte)
            let stringObj = JSON.stringify(queryObj);

            stringObj = stringObj.replace(
                /\b(gt|lt|lte|gte|ne|eq|in)\b/g,
                (match) => `$${match}`
            );

            updatedData = JSON.parse(stringObj) as Record<string, any>;

            // updatedData = queryObj;
        }

        return updatedData;
    },

    sort(data: string | object = '') {
        // sort='price,age,-name' - Query

        const sort: Record<string, any> = {};

        if (data && typeof data === 'string') {
            let split = data.split(',');
            split.forEach((field: string) => {
                if (field.startsWith('-')) sort[field.split('-')[1]] = -1;
                else sort[field] = 1
            });
        }

        sort["createdAt"] = -1;

        console.log(sort);
        return sort;
    },

    populate(populateOptions: CustomPopulateOptions) {
        // POPULATION
        const pipeline = [];
        if (populateOptions === undefined) return pipeline;

        const lookupField = lookups[populateOptions?.path];

        if (lookupField) {
            const projection: Record<string, any> = {}

            populateOptions.as = populateOptions.as || populateOptions.path;

            if (populateOptions.select) {
                populateOptions.select.forEach((project: string) => {
                    projection[project] = 1;
                });
            }

            pipeline.push({
                $lookup: {
                    from: lookupField.from,
                    localField: lookupField.localField,
                    foreignField: lookupField.foreignField,
                    pipeline: [
                        ...(Object.keys(projection).length > 0) ? [{ $project: projection }] : [],
                        { $match: populateOptions.match || {} },
                        ...(Array.isArray(lookupField.pipeline) ? lookupField.pipeline : [])
                    ],
                    as: populateOptions.as
                }
            })

            if (lookupField.count) {
                pipeline.push({ $addFields: { [`${populateOptions.as}`]: { $size: `$${populateOptions.as}` } } })
            }
            else {
                const unwindType = (populateOptions.unwindType !== undefined) ? populateOptions.unwindType : 0;

                if (unwindType === 1 || unwindType === 2) {
                    pipeline.push({
                        $unwind: { path: `$${populateOptions.as}`, preserveNullAndEmptyArrays: true }
                    });

                    if (populateOptions.sortPopulate) {
                        const sort = AggregateQueryMethods.sort(populateOptions.sortPopulate);

                        pipeline.push({
                            $sort: sort
                        })
                    }

                    if (unwindType === 2) {
                        const addedFields = {};

                        if (populateOptions.select) {
                            populateOptions.select.forEach((project: string) => {
                                addedFields[project] = `$${populateOptions.as}.${project}`;
                            });
                        }

                        pipeline.push({
                            $addFields: addedFields
                        })

                        pipeline.push({
                            $project: {
                                [`${populateOptions.as}`]: 0
                            }
                        })
                    }
                }
            }

            if (Array.isArray(populateOptions.populate) && populateOptions.populate.length > 0) {
                populateOptions.populate.forEach((option: CustomPopulateOptions) => {
                    const lookupF = lookups[option?.path];

                    if (lookupF) {
                        const projection: Record<string, any> = {}

                        if (option.select) {
                            option.select.forEach((project: string) => {
                                projection[project] = 1;
                            });
                        }

                        option.as = option.as || option.path;

                        pipeline.push({
                            $lookup: {
                                from: lookupF.from,
                                localField: `${populateOptions.as}.${lookupF.localField}`,
                                foreignField: lookupF.foreignField,
                                pipeline: [
                                    ...(Object.keys(projection).length > 0) ? [{ $project: projection }] : [],
                                    { $match: option.match || {} },
                                    ...(Array.isArray(lookupField.pipeline) ? lookupField.pipeline : [])
                                ],
                                as: option.as
                            }
                        })

                        if (lookupField.count) {
                            pipeline.push({ $addFields: { [`${option.as}`]: { $size: `$${option.as}` } } })
                        }
                        else {
                            const unwindType = (option.unwindType !== undefined) ? option.unwindType : 0;

                            if (unwindType === 1 || unwindType === 2) {
                                pipeline.push({
                                    $unwind: { path: `$${option.as}`, preserveNullAndEmptyArrays: true }
                                });

                                if (option.sortPopulate) {
                                    const sort = AggregateQueryMethods.sort(option.sortPopulate);

                                    pipeline.push({
                                        $sort: sort
                                    })
                                }

                                if (unwindType === 2) {
                                    const addedFields = {};

                                    if (option.select) {
                                        option.select.forEach((project: string) => {
                                            addedFields[project] = `$${option.as}.${project}`;
                                        });
                                    }

                                    pipeline.push({
                                        $addFields: addedFields
                                    })

                                    pipeline.push({
                                        $project: {
                                            [`${option.as}`]: 0
                                        }
                                    })
                                }
                            }
                        }
                    }
                })
            }
        }

        return pipeline;

    },

    paginate(page: number = 1, limit: number = 10) {
        return [
            {
                $skip: (+page - 1) * +limit // Skip documents based on the page number and page size
            },
            {
                $limit: +limit // Limit the number of documents per page
            },
        ]
    }
};

export async function customPaginate<T>(model: Model<T>, pipeline: PipelineStage[], query: Record<string, any>, paginateOptions: PaginateOptions) {

    const data = await model.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [{ $match: { ...query } }];
    const totalCount = await model.aggregate(countPipeline).count("count").exec();
    const totalData = totalCount.length > 0 ? totalCount[0].count : 0;

    return {
        docs: data,
        totalDocs: totalData,
        limit: paginateOptions.limit,
        totalPages: Math.ceil(totalData / (paginateOptions.limit)),
        page: paginateOptions.page,
        pagingCounter: (paginateOptions.page - 1) * (paginateOptions.limit) + 1,
        hasPrevPage: (paginateOptions.page) > 1,
        hasNextPage: (paginateOptions.page) < Math.ceil(totalData / (paginateOptions.limit)),
        prevPage: (paginateOptions.page) > 1 ? (paginateOptions.page) - 1 : null,
        nextPage: (paginateOptions.page) < Math.ceil(totalData / (paginateOptions.limit)) ? paginateOptions.page + 1 : null
    };
}