import{r as m,j as r,g as p}from"./index-DZ1Da_uc.js";const y={primary:"bg-primary-600 text-white shadow-sm shadow-primary-900/15 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-primary-400 border-transparent",secondary:"bg-white text-gray-700 border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 active:translate-y-0 active:scale-[0.98] focus:ring-primary-400",accent:"bg-accent-500 text-white shadow-sm shadow-accent-900/15 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:ring-accent-300 border-transparent",danger:"bg-error text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0 active:scale-[0.98] focus:ring-red-400 border-transparent",ghost:"bg-transparent text-gray-600 hover:bg-primary-50 hover:text-primary-800 active:scale-[0.98] focus:ring-primary-300 border-transparent"},g={sm:"h-8 px-3 text-sm gap-1.5",md:"h-10 px-4 text-sm gap-2",lg:"h-12 px-6 text-base gap-2"},v=m.forwardRef(({variant:s="primary",size:o="md",isLoading:e=!1,leftIcon:a,rightIcon:t,disabled:n,className:i="",children:c,...l},d)=>{const h=n||e;return r.jsx("button",{ref:d,disabled:h,className:`
          inline-flex items-center justify-center
          font-bold rounded-xl border
          transition-all duration-200 ease-travel
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          ${y[s]}
          ${g[o]}
          ${i}
        `,"aria-busy":e||void 0,...l,children:e?r.jsx(p,{size:"sm"}):r.jsxs(r.Fragment,{children:[a&&r.jsx("span",{className:"flex-shrink-0",children:a}),c,t&&r.jsx("span",{className:"flex-shrink-0",children:t})]})})});v.displayName="Button";export{v as B};
