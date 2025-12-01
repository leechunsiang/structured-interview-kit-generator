'use client';

import {
    motion,
    MotionValue,
    useMotionValue,
    useSpring,
    useTransform,
    type SpringOptions,
    AnimatePresence,
} from 'framer-motion';
import {
    Children,
    cloneElement,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { cn } from '@/lib/utils';

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

type DockProps = {
    children: React.ReactNode;
    className?: string;
    distance?: number;
    panelHeight?: number;
    magnification?: number;
    spring?: SpringOptions;
    direction?: 'horizontal' | 'vertical';
};
type DockItemProps = {
    className?: string;
    children: React.ReactNode;
};
type DockLabelProps = {
    className?: string;
    children: React.ReactNode;
};
type DockIconProps = {
    className?: string;
    children: React.ReactNode;
};

type DocContextType = {
    mouseX: MotionValue;
    spring: SpringOptions;
    magnification: number;
    distance: number;
    direction: 'horizontal' | 'vertical';
};
type DockProviderProps = {
    children: React.ReactNode;
    value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
    return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
    const context = useContext(DockContext);
    if (!context) {
        throw new Error('useDock must be used within an DockProvider');
    }
    return context;
}

function Dock({
    children,
    className,
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = DEFAULT_MAGNIFICATION,
    distance = DEFAULT_DISTANCE,
    panelHeight = DEFAULT_PANEL_HEIGHT,
    direction = 'horizontal',
}: DockProps) {
    const mouseX = useMotionValue(Infinity);
    const isHovered = useMotionValue(0);

    const maxHeight = useMemo(() => {
        return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
    }, [magnification]);

    const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
    const height = useSpring(heightRow, spring);

    return (
        <motion.div
            style={{
                height: direction === 'horizontal' ? height : undefined,
                width: direction === 'vertical' ? height : undefined,
                scrollbarWidth: 'none',
            }}
            className={cn(
                'mx-2 flex max-w-full items-end overflow-x-auto',
                direction === 'vertical' && 'flex-col h-full w-fit items-start overflow-visible mx-0 my-2',
                className
            )}
        >
            <motion.div
                onMouseMove={({ pageX, pageY }) => {
                    isHovered.set(1);
                    mouseX.set(direction === 'horizontal' ? pageX : pageY);
                }}
                onMouseLeave={() => {
                    isHovered.set(0);
                    mouseX.set(Infinity);
                }}
                className={cn(
                    'mx-auto flex w-fit gap-4 rounded-2xl bg-gray-50 px-4 dark:bg-neutral-900',
                    direction === 'vertical' && 'flex-col h-fit w-fit py-4 px-2 bg-transparent dark:bg-transparent',
                    className
                )}
                style={{
                    height: direction === 'horizontal' ? panelHeight : undefined,
                    width: direction === 'vertical' ? undefined : undefined,
                }}
                role='toolbar'
                aria-label='Application dock'
            >
                <DockProvider value={{ mouseX, spring, distance, magnification, direction }}>
                    {children}
                </DockProvider>
            </motion.div>
        </motion.div>
    );
}

function DockItem({ children, className }: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { distance, magnification, mouseX, spring, direction } = useDock();

    const isHovered = useMotionValue(0);

    const mouseDistance = useTransform(mouseX, (val) => {
        const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
        if (direction === 'horizontal') {
            return val - domRect.x - domRect.width / 2;
        } else {
            return val - domRect.y - domRect.height / 2;
        }
    });

    const widthTransform = useTransform(
        mouseDistance,
        [-distance, 0, distance],
        [50, magnification, 50]
    );

    const width = useSpring(widthTransform, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                width,
                height: direction === 'vertical' ? width : undefined,
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            className={cn(
                'relative inline-flex items-center justify-center',
                className
            )}
            tabIndex={0}
            role='button'
            aria-haspopup='true'
        >
            {Children.map(children, (child) =>
                cloneElement(child as React.ReactElement<any>, { width, isHovered })
            )}
        </motion.div>
    );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
    const restProps = rest as Record<string, unknown>;
    const isHovered = restProps['isHovered'] as MotionValue<number>;
    const [isVisible, setIsVisible] = useState(false);
    const { direction } = useDock();

    useEffect(() => {
        const unsubscribe = isHovered.on('change', (latest) => {
            setIsVisible(latest === 1);
        });

        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{
                        opacity: 1,
                        y: direction === 'horizontal' ? -10 : 0,
                        x: direction === 'vertical' ? 10 : '-50%'
                    }}
                    exit={{ opacity: 0, y: 0, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        'absolute w-fit whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white',
                        direction === 'horizontal' && '-top-6 left-1/2',
                        direction === 'vertical' && 'left-full top-1/2 -translate-y-1/2 ml-2',
                        className
                    )}
                    role='tooltip'
                    style={{ x: direction === 'horizontal' ? '-50%' : 0, y: direction === 'vertical' ? '-50%' : 0 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
    const restProps = rest as Record<string, unknown>;
    const width = restProps['width'] as MotionValue<number>;

    const widthTransform = useTransform(width, (val) => val * 0.8);

    return (
        <motion.div
            style={{ width: widthTransform, height: widthTransform }}
            className={cn('flex items-center justify-center', className)}
        >
            {children}
        </motion.div>
    );
}

export { Dock, DockIcon, DockItem, DockLabel };
