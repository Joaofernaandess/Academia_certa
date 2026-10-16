import Ban from 'lucide-react/dist/esm/icons/ban.mjs';
import CircleCheck from 'lucide-react/dist/esm/icons/circle-check.mjs';
import CircleMinus from 'lucide-react/dist/esm/icons/circle-minus.mjs';
import CirclePlus from 'lucide-react/dist/esm/icons/circle-plus.mjs';
import Clock from 'lucide-react/dist/esm/icons/clock.mjs';
import Ellipsis from 'lucide-react/dist/esm/icons/ellipsis.mjs';
import LinkIcon from 'lucide-react/dist/esm/icons/link.mjs';
import Menu from 'lucide-react/dist/esm/icons/menu.mjs';
import Moon from 'lucide-react/dist/esm/icons/moon.mjs';
import MoveRight from 'lucide-react/dist/esm/icons/move-right.mjs';
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs';
import Rocket from 'lucide-react/dist/esm/icons/rocket.mjs';
import Search from 'lucide-react/dist/esm/icons/search.mjs';
import Sun from 'lucide-react/dist/esm/icons/sun.mjs';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.mjs';
import Save from 'lucide-react/dist/esm/icons/save.mjs';
import X from 'lucide-react/dist/esm/icons/x.mjs';
import RotateCcw  from 'lucide-react/dist/esm/icons/rotate-ccw.mjs';
import Plus from 'lucide-react/dist/esm/icons/plus.mjs';
import User from 'lucide-react/dist/esm/icons/user.mjs';
import GlassWater from 'lucide-react/dist/esm/icons/glass-water.mjs';

const ICONS = {
    ban: Ban,
    check: CircleCheck,
    clock: Clock,
    ellipsis: Ellipsis,
    link: LinkIcon,
    menu: Menu,
    moon: Moon,
    transfer: MoveRight,
    minus: CircleMinus,
    pencil: Pencil,
    'circle-plus': CirclePlus,
    rocket: Rocket,
    search: Search,
    sun: Sun,
    save: Save,
    trash: Trash2,
    x: X,
    'rotate-ccw': RotateCcw,
    plus: Plus,
    user: User,
    glassWater: GlassWater
};

export default function ZeniteIcon({ name, className = '', size = 20, strokeWidth = 2.25 }) {
    const Icon = ICONS[name];
    if (!Icon) return null;

    return (
        <Icon
            aria-hidden="true"
            className={className}
            size={size}
            strokeWidth={strokeWidth}
        />
    );
}