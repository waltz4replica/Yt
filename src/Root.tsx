import React from 'react';
import {Composition, Still} from 'remotion';
import {Logo, Miniatura, Portada} from './brand/Brand';
import './fonts';
import data from './generated/videos.json';
import {FPS, H, W} from './theme';
import type {Canal, VideoData} from './types';
import {Video} from './Video';

const videos = data.videos as unknown as VideoData[];
const canal = data.canal as unknown as Canal;

export const Root: React.FC = () => (
  <>
    {videos.map((v) => (
      <Composition
        key={v.id}
        id={`video-${v.id}`}
        component={Video}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={v.frames}
        defaultProps={{video: v, canal}}
      />
    ))}
    {videos.map((v) => (
      <Still key={v.id} id={`miniatura-${v.id}`} component={Miniatura} width={1280} height={720} defaultProps={{video: v, canal}} />
    ))}
    <Still id="logo" component={Logo} width={800} height={800} />
    <Still id="portada" component={Portada} width={2560} height={1440} defaultProps={{canal}} />
  </>
);
