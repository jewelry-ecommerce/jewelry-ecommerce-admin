// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test, vi } from 'vitest';
import { CmsDemoStatus } from '@/apis/cms-demo/cms-demo.interface';
const effects=vi.hoisted(()=>({hydrate:vi.fn()}));
vi.mock('swr',()=>({default:()=>({data:{id:'2',name:'Cached page',slug:'cached',locale:'vi-VN',isActive:true,status:CmsDemoStatus.PUBLISHED,
  seo:{title:'SEO',description:'Description'},targetDevice:'DESKTOP',scheduleStart:null,scheduleEnd:null,
  blocks:[{id:'4',blockTypeCode:'INFO_CARDS',config:{cards:[]},isVisible:true}]},error:undefined})}));
vi.mock('@/apis/java/java-cms.api',()=>({javaCmsPage:vi.fn()}));
import { useJavaCmsDraft } from './java-cms-draft';
test('cached SWR data hydrates metadata, blocks and device without relying on onSuccess',async()=>{
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  let snapshot:ReturnType<typeof useJavaCmsDraft>|undefined;
  function Harness(){snapshot=useJavaCmsDraft({mode:'edit',pageId:'2',onHydrateForm:effects.hydrate});return null;}
  const root=createRoot(document.createElement('div'));
  try{
    await act(async()=>{root.render(<Harness/>);});
    expect(effects.hydrate).toHaveBeenCalledWith(expect.objectContaining({name:'Cached page',seoTitle:'SEO'}));
    expect(snapshot?.blocks).toHaveLength(1);
    expect(snapshot?.displaySettings.targetDevice).toBe('DESKTOP');
  }finally{await act(async()=>{root.unmount();});vi.unstubAllGlobals();}
});
