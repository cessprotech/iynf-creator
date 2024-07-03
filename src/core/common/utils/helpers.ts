export const mapKeysToValues = <T>(obj: T) => {
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

export const checkType = <T>(value: T, type: string) => {
	const types = {
		'object': '[object Object]',
		'array': '[object Array]',
	};

	return Object.prototype.toString.call(value) === types[type];
}

export const objectIsEmpty = (value: Record<string, unknown>) => {
	return Object.keys(value).length < 1;
}

// export const GET_KEY_VALUES = <T>(
//   record: T,
// ): Readonly<Record<keyof T, string>> => {

//   return record as unknown as Record<keyof T, string>;
// };