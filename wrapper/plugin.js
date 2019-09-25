import plugin from './lib/wrapper'
import { Filters } from './lib/filters'
import { Directives } from './lib/directives'
import { ZnForm } from './lib/zn-form'
import { ZnData } from './lib/zn-data'

Filters(plugin)
Directives(plugin)
ZnForm(plugin)
ZnData(plugin)

/* PLUGIN_JS */
