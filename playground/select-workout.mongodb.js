/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('fit-note');

// Search for documents in the current collection.
db.getCollection('workouts')
  .find(
    {
    //   userId: {
    //     "$oid": "6836ff9a7f5f9b2d0e326bc9"
    //   }
      /*
      * Filter
      * fieldA: value or expression
      */
    //   userId: '6833e12eec0b3d761cd9cacf'
    userId: '6836ff9a7f5f9b2d0e326bc9'
  },
    {
      /*
      * Projection
      * _id: 0, // exclude _id
      * fieldA: 1 // include field
      */
    }
  )
  .sort({
    updatedAt: -1
    /*
    * fieldA: 1 // ascending
    * fieldB: -1 // descending
    */
  });
