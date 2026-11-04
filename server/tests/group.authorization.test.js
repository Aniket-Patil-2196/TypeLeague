import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { areIdsEqual, getNormalizedId } from '../src/utils/id.utils.js';

test('areIdsEqual handles ObjectId, string, and populated objects', () => {
  const idStr = '507f1f77bcf86cd799439011';
  const objId = new mongoose.Types.ObjectId(idStr);
  const populatedDoc = { _id: objId, username: 'tester' };
  const differentId = new mongoose.Types.ObjectId();

  assert.equal(areIdsEqual(idStr, objId), true);
  assert.equal(areIdsEqual(objId, idStr), true);
  assert.equal(areIdsEqual(populatedDoc, idStr), true);
  assert.equal(areIdsEqual(populatedDoc, objId), true);
  assert.equal(areIdsEqual(objId, populatedDoc), true);
  assert.equal(areIdsEqual(idStr, populatedDoc), true);

  assert.equal(areIdsEqual(idStr, differentId), false);
  assert.equal(areIdsEqual(null, idStr), false);
  assert.equal(areIdsEqual(undefined, objId), false);
  assert.equal(areIdsEqual('', ''), false);
});

test('getNormalizedId extracts string representation correctly', () => {
  const idStr = '507f1f77bcf86cd799439011';
  const objId = new mongoose.Types.ObjectId(idStr);
  const populatedDoc = { _id: objId };

  assert.equal(getNormalizedId(idStr), idStr);
  assert.equal(getNormalizedId(objId), idStr);
  assert.equal(getNormalizedId(populatedDoc), idStr);
  assert.equal(getNormalizedId(null), '');
  assert.equal(getNormalizedId(undefined), '');
});
