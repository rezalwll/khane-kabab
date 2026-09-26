import { expect,it } from 'vitest';
import { ApiError } from '../../lib/errors.js';
import { validateOptionSelection } from './option-validation.js';
it('rejects an option outside the product option groups',()=>expect(()=>validateOptionSelection([{id:'g1',minSelect:0,maxSelect:null,isRequired:false}],[{id:'o1',optionGroupId:'g2',isActive:true}],['o1'])).toThrow(ApiError));
