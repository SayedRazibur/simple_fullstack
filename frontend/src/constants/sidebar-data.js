import {
  IconChecklist,
  IconLayoutDashboard,
  IconMessages,
  IconSettings,
  IconUsers,
  IconCalendarWeek,
  IconBell,
  IconListCheck,
  IconMapPin,
  IconShoppingCart,
  IconShoppingBag,
  IconUser,
  IconFiles,
  IconShoppingCartPlus,
  IconBasketDollar,
  IconBrandReact,
} from '@tabler/icons-react';

export const getSidebarData = (isAdmin) => ({
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Today', url: '/dashboard', icon: IconCalendarWeek },
        { title: 'Reminders', url: '/reminder', icon: IconBell },
        { title: 'Tasks', url: '/task', icon: IconListCheck },
        { title: 'Orders', url: '/orders', icon: IconShoppingCartPlus },
        {
          title: 'Sites and Refill',
          url: '/sites-and-refill',
          icon: IconMapPin,
        },
        {
          title: 'Purchases',
          url: '/purchases',
          icon: IconBasketDollar,
        },
        {
          title: 'Suppliers',
          url: '/suppliers',
          icon: IconBasketDollar,
        },
        { title: 'Products', url: '/products', icon: IconShoppingBag },
        { title: 'CRM', url: '/crm', icon: IconUser },
        { title: 'Documents', url: '/documents', icon: IconFiles },
      ],
    },
    {
      title: '',
      items: [
        {
          title: 'Reference Data',
          url: '/reference-data',
          icon: IconBrandReact,
        },
      ],
    },
    isAdmin
      ? {
          title: '',
          items: [{ title: 'Settings', url: '/settings', icon: IconSettings }],
        }
      : null,
  ].filter(Boolean),
});

// {
//   title: 'Pages',
//   items: [
//     {
//       title: 'Auth',
//       icon: IconLockAccess,
//       items: [
//         {
//           title: 'Sign In',
//           url: '/sign-in',
//         },
//         {
//           title: 'Sign Up',
//           url: '/sign-up',
//         },
//         {
//           title: 'Forgot Password',
//           url: '/forgot-password',
//         },
//         {
//           title: 'OTP',
//           url: '/otp',
//         },
//       ],
//     },
//     {
//       title: 'Errors',
//       icon: IconBug,
//       items: [
//         {
//           title: 'Unauthorized',
//           url: '/401',
//           icon: IconLock,
//         },
//         {
//           title: 'Forbidden',
//           url: '/403',
//           icon: IconUserOff,
//         },
//         {
//           title: 'Not Found',
//           url: '/404',
//           icon: IconError404,
//         },
//         {
//           title: 'Internal Server Error',
//           url: '/500',
//           icon: IconServerOff,
//         },
//         {
//           title: 'Maintenance Error',
//           url: '/maintenance',
//           icon: IconBarrierBlock,
//         },
//       ],
//     },
//   ],
// },
