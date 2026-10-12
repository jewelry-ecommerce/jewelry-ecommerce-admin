
import {IconButton,Typography,type IconButtonProps,type TypographyProps} from '@mui/material';
import {IconElement} from './icon.element';
import type {ReactNode} from 'react';
export function ButtonIconElement({icon,...props}:IconButtonProps&{icon:string}){return <IconButton {...props}><IconElement icon={icon}/></IconButton>;}
export function TypographyOneLine({content,...props}:Omit<TypographyProps,'content'>&{content?:ReactNode}){return <Typography noWrap {...props}>{content}</Typography>;}
