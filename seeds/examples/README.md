# Seeds Examples

This directory contains additional example seeders you can reference.

## Creating Custom Seeders

You can create custom seeders for specific needs:

```typescript
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';

export async function seedCustomData() {
  const documents = getDocumentsAdapter();

  // Your custom seeding logic
  const result = await documents.createDocument({
    collection: 'your-collection',
    update: {
      // your data
    },
  });

  console.log('Custom data seeded:', result.data._id);
}
```

Then import and use it in `../index.ts`.
