import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFirstImage } from './article-image.ts';

test('본문 순서대로 첫 이미지를 찾고 이미지가 없으면 null을 반환한다', () => {
 assert.equal(extractFirstImage('<img src="/first.png"> ![두 번째](/second.png)'), '/first.png');
 assert.equal(extractFirstImage('![대표](/first.png "설명")'), '/first.png');
 assert.equal(extractFirstImage('이미지 없는 글'), null);
});
