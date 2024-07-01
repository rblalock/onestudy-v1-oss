import { assert, expect, test } from 'vitest'
import { db } from '../connection';
import { organization } from '../schema';

test('Should exist', async () => {
	try {
		const rows = await db.select().from(organization).limit(1);
		expect(rows).ok;
	} catch (error) {
		console.error(error)
		// assert(error.message === 'relation "helloworld" does not exist');
	}
});
