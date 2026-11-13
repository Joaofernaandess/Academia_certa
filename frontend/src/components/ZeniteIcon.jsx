import Ban from 'lucide-react/dist/esm/icons/ban.mjs';
import Camera from 'lucide-react/dist/esm/icons/camera.mjs';
import CircleCheck from 'lucide-react/dist/esm/icons/circle-check.mjs';
import CircleMinus from 'lucide-react/dist/esm/icons/circle-minus.mjs';
import CirclePlus from 'lucide-react/dist/esm/icons/circle-plus.mjs';
import Clock from 'lucide-react/dist/esm/icons/clock.mjs';
import Ellipsis from 'lucide-react/dist/esm/icons/ellipsis.mjs';
import File from 'lucide-react/dist/esm/icons/file.mjs';
import FileSearch from 'lucide-react/dist/esm/icons/file-search.mjs';
import FileUp from 'lucide-react/dist/esm/icons/file-up.mjs';
import GlassWater from 'lucide-react/dist/esm/icons/glass-water.mjs';
import ImageIcon from 'lucide-react/dist/esm/icons/image.mjs';
import LinkIcon from 'lucide-react/dist/esm/icons/link.mjs';
import Maximize2 from 'lucide-react/dist/esm/icons/maximize-2.mjs';
import Menu from 'lucide-react/dist/esm/icons/menu.mjs';
import Moon from 'lucide-react/dist/esm/icons/moon.mjs';
import MoveRight from 'lucide-react/dist/esm/icons/move-right.mjs';
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs';
import Plus from 'lucide-react/dist/esm/icons/plus.mjs';
import Rocket from 'lucide-react/dist/esm/icons/rocket.mjs';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw.mjs';
import RotateCw from 'lucide-react/dist/esm/icons/rotate-cw.mjs';
import Save from 'lucide-react/dist/esm/icons/save.mjs';
import Search from 'lucide-react/dist/esm/icons/search.mjs';
import Sun from 'lucide-react/dist/esm/icons/sun.mjs';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.mjs';
import User from 'lucide-react/dist/esm/icons/user.mjs';
import X from 'lucide-react/dist/esm/icons/x.mjs';

const ICONS = {
    ban: Ban,
    camera: Camera,
    check: CircleCheck,
    clock: Clock,
    ellipsis: Ellipsis,
    file: File,
    'file-search': FileSearch,
    'file-up': FileUp,
    image: ImageIcon,
    link: LinkIcon,
    maximize: Maximize2,
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
    'rotate-cw': RotateCw,
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