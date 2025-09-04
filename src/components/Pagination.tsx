// ============================================================================
// PAGINATION - INTERBØX V2
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TIPOS
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'dots';
  disabled?: boolean;
}

interface PaginationItemProps {
  page: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PAGINATION_SIZES = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  disabled = false
}: PaginationProps) {
  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const getVisiblePages = (): number[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        {showPrevNext && (
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            size={size}
          >
            ←
          </PaginationButton>
        )}
        
        <span className={`${PAGINATION_SIZES[size]} text-gray-600`}>
          Página {currentPage} de {totalPages}
        </span>
        
        {showPrevNext && (
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            size={size}
          >
            →
          </PaginationButton>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {visiblePages.map((page, index) => (
          <motion.button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={disabled}
            className={`w-2 h-2 rounded-full transition-colors ${
              page === currentPage
                ? 'bg-pink-500'
                : 'bg-gray-300 hover:bg-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    );
  }

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Primeira página */}
      {showFirstLast && currentPage > 2 && (
        <>
          <PaginationButton
            onClick={() => handlePageChange(1)}
            disabled={disabled}
            size={size}
          >
            1
          </PaginationButton>
          {currentPage > 3 && (
            <span className={`${PAGINATION_SIZES[size]} text-gray-400`}>
              ...
            </span>
          )}
        </>
      )}

      {/* Página anterior */}
      {showPrevNext && (
        <PaginationButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          size={size}
        >
          ←
        </PaginationButton>
      )}

      {/* Páginas visíveis */}
      {visiblePages.map((page) => (
        <PaginationButton
          key={page}
          onClick={() => handlePageChange(page)}
          disabled={disabled}
          isActive={page === currentPage}
          size={size}
        >
          {page}
        </PaginationButton>
      ))}

      {/* Próxima página */}
      {showPrevNext && (
        <PaginationButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          size={size}
        >
          →
        </PaginationButton>
      )}

      {/* Última página */}
      {showFirstLast && currentPage < totalPages - 1 && (
        <>
          {currentPage < totalPages - 2 && (
            <span className={`${PAGINATION_SIZES[size]} text-gray-400`}>
              ...
            </span>
          )}
          <PaginationButton
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled}
            size={size}
          >
            {totalPages}
          </PaginationButton>
        </>
      )}
    </nav>
  );
}

// ============================================================================
// COMPONENTE DE BOTÃO
// ============================================================================

function PaginationButton({
  onClick,
  disabled,
  isActive = false,
  size = 'md',
  children
}: {
  onClick: () => void;
  disabled: boolean;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${PAGINATION_SIZES[size]}
        rounded-lg font-medium transition-all duration-200
        ${isActive
          ? 'bg-pink-500 text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-sm'
        }
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  );
}

// ============================================================================
// COMPONENTE DE INFORMAÇÕES
// ============================================================================

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      Mostrando {startItem} a {endItem} de {totalItems} itens
    </div>
  );
}

// ============================================================================
// COMPONENTE DE SELEÇÃO DE ITENS POR PÁGINA
// ============================================================================

export function ItemsPerPageSelector({
  value,
  onChange,
  options = [10, 25, 50, 100],
  className = ''
}: {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label className="text-sm text-gray-600">
        Itens por página:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// COMPONENTE COMPLETO DE PAGINAÇÃO
// ============================================================================

export function CompletePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
  showInfo = true,
  showItemsPerPage = true,
  ...paginationProps
}: PaginationProps & {
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  showInfo?: boolean;
  showItemsPerPage?: boolean;
}) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Informações */}
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        {...paginationProps}
      />

      {/* Seletor de itens por página */}
      {showItemsPerPage && (
        <ItemsPerPageSelector
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR PAGINAÇÃO
// ============================================================================

export function usePagination(
  totalItems: number,
  initialItemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(totalPages);
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changeItemsPerPage
  };
}
