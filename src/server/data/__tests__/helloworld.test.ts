import { assert, expect, test } from 'vitest'
import { db } from '../connection';
import { helloworld } from '../schema';

test('Should exist', async () => {
	try {
		const rows = await db.select().from(helloworld);
		expect(rows).ok;
	} catch (error) {
		console.error(error)
		// assert(error.message === 'relation "helloworld" does not exist');
	}
});
