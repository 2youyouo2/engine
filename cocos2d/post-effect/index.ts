import './post-effect'

import PostEffectRenderer from './post-effect-renderer';
import BlurPostEffectRenderer from './renderers/blur';

PostEffectRenderer.registerRenderer('Base', PostEffectRenderer);
PostEffectRenderer.registerRenderer('Blur', BlurPostEffectRenderer);
