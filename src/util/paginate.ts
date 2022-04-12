import { Aggregate, Query } from 'mongoose';
import { PaginateOptions, PaginationRes } from './types';
export async function paginate<T = any>(
  query: Query<T[], T> | Aggregate<T>,
  options: PaginateOptions,
  project?: any,
): Promise<PaginationRes<T>> {
  // eslint-disable-next-line prefer-const
  let { perPage, page } = options;

  page = !page || page < 0 ? 0 : page;
  const offset = page * perPage;
  let items: T[], count: number;
  if (query instanceof Query) {
    const qc = query.toConstructor();

    const getQuery = new qc().skip(offset).limit(perPage);
    const countQuery = new qc().countDocuments();
    [items, count] = await Promise.all([getQuery.exec(), countQuery.exec()]);
  } else {
    const pagination = {
      $facet: {
        items: [{ $skip: offset }, { $limit: perPage }, { $project: project }],
        meta: [
          { $count: 'totalItems' },
          { $addFields: { currentPage: Number(page) } },
          { $addFields: { perPage: perPage } },
          {
            $addFields: {
              totalPages: {
                $ceil: { $divide: ['$totalItems', perPage] },
              },
            },
          },
        ],
      },
    };
    const result = (await query.append(pagination))[0];

    items = result.items;
    count = result.meta[0] ? result.meta[0].totalItems : 0;
  }
  return {
    items: items,
    meta: {
      perPage,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / perPage),
    },
  };
}
export function noResultPaginate<T = any>({
  page,
  perPage,
}: PaginateOptions): PaginationRes<T> {
  return {
    items: [],
    meta: {
      perPage: perPage,
      currentPage: page,
      totalItems: 0,
      totalPages: 0,
    },
  };
}
