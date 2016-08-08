import page from 'page';
import index from './pages/index'
import orbits from './pages/orbits'

page('/', index);
page('/orbits', orbits);
page({
  hashbang: true,
});
