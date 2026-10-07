import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const articles=defineCollection({
 loader:glob({pattern:'**/*.md',base:process.env.ITSDEV_CONTENT_FIXTURES==='1'?'./.codex/content-fixtures':'./src/content/articles'}),
 schema:z.object({
  title:z.string().min(1),description:z.string().min(1),documentId:z.string().min(1),
  pubDate:z.coerce.date(),updatedDate:z.coerce.date().optional(),
  category:z.enum(['infra','backend','ai','log']),tags:z.array(z.string()),
  draft:z.boolean(),sample:z.boolean().default(false),
  articleType:z.enum(['design','decision','incident','implementation']).optional(),
  service:z.enum(['djc','withbuddy','myai']).optional(),featured:z.boolean().default(false),
  canonical:z.url().optional(),environment:z.array(z.string()).optional(),
  evidenceStatus:z.enum(['planned','partial','verified']),verifiedAt:z.coerce.date().optional(),
  evidence:z.array(z.string()).default([]),
  revisions:z.array(z.object({rev:z.string().min(1),date:z.coerce.date(),summary:z.string().min(1)})).default([]),
 }).superRefine((data,ctx)=>{
  if(data.evidenceStatus==='verified' && (!data.verifiedAt || !data.evidence.length))ctx.addIssue({code:'custom',message:'verified requires verifiedAt and execution evidence'});
  if(new Set(data.revisions.map(r=>r.rev)).size!==data.revisions.length)ctx.addIssue({code:'custom',message:'Duplicate revision'});
  if(data.updatedDate && data.updatedDate<data.pubDate)ctx.addIssue({code:'custom',message:'updatedDate cannot precede pubDate'});
  if(data.canonical && !data.canonical.startsWith('https://'))ctx.addIssue({code:'custom',message:'canonical requires https'});
 })
});
export const collections={articles};
