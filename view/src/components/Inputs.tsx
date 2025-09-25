import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from "react-select";
import { normalizeStr } from './Auxiliares/utils';
import Spinner from './Loading';

// Input
interface InputProps {
  label?: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  min?: number;
  maxLength?: number;
  disable?: boolean;
  placeholder?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  step?: number;
  className?: string;
}

export const Input = ({
  label,
  name,
  value,
  onChange,
  required = true,
  type = 'text',
  min = 0,
  maxLength,
  disable = false,
  placeholder = "",
  onBlur,
  step,
  className,
}: InputProps) => (
  <div className="w-full">
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-900">
      {label}{required && ' *'}
    </label>
    <input
      type={name === 'senha' ? 'password' : type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      maxLength={maxLength}
      disabled={disable}
      placeholder={placeholder}
      step={step}
      className={`border border-gray-300 text-gray-900 text-sm rounded-md focus:border-2 focus:border-blue-500 focus:outline-none block w-full p-2.5 bg-white ${className} disabled:opacity-40 disabled:cursor-not-allowed`}
      onBlur={onBlur}
    />
  </div>
);

// Select
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
  disable?: boolean;
  className?: string
}

export const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
  placeholder = 'Selecione uma opção',
  disable = false,
  className = "border border-gray-300 text-sm rounded-md block w-full p-2.5 focus:border-2 focus:border-blue-500 focus:outline-none bg-white"
}: SelectInputProps) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-900">
        {label}{required && ' *'}
      </label>
    )}
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disable}
      className={`${className} disabled:opacity-40 disabled:cursor-not-allowed`}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Multiple Select
export interface SelectMultipleOption<T extends string | number = string> {
  value: T;
  label: string;
}

interface SelectMultiInputProps<T extends string | number = number> {
  label: string;
  name: string;
  value: T[];
  onChange: (values: T[]) => void;
  options: SelectMultipleOption<T>[];
  required?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
}

export const SelectMultiInput = <T extends string | number>({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
  placeholder = "Selecione...",
  isDisabled = false,
}: SelectMultiInputProps<T>) => {
  const selected = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="w-full">
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-900">
        {label}
        {required && " *"}
      </label>
      <Select
        inputId={name}
        isMulti
        options={options}
        value={selected}
        onChange={(selected) => onChange(selected.map((s) => s.value))}
        isDisabled={isDisabled}
        placeholder={placeholder}
        className="text-sm"
        classNamePrefix="select"
      />
    </div>
  );
};

// Text Area
interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}

export const TextArea = ({
  label,
  name,
  value,
  onChange,
  required = true,
  rows = 4,
  maxLength,
  placeholder = "",
}: TextAreaProps) => (
  <div className="w-full">
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-900">
      {label}{required && ' *'}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      className="border border-gray-300 text-gray-900 text-sm rounded-md focus:border-2 focus:border-blue-500 focus:outline-none block w-full p-2.5 resize-none bg-white"
    />
  </div>
);

// CheckBox
interface CheckboxStatusProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function CheckboxStatus({ checked, onChange, disabled = false }: CheckboxStatusProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-200 rounded-md focus:ring-yellow-500 focus:ring-2 disabled:opacity-50 cursor-pointer"
    />
  );
}

// SelectSearch
type Option = { label: string; value: string | number };

interface Props {
  label?: string;
  name?: string;
  options: Option[];
  value: string | number | "";
  onChange: (v: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  allowClear?: boolean;
  emptyOptionLabel?: string;
}

export function SearchableSelect({
  label,
  name,
  options,
  value,
  onChange,
  placeholder = "Pesquisar...",
  disabled,
  loading,
  className = "",
  allowClear = true,
  emptyOptionLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // inclui a opção vazia no topo, se pedida
  const baseOptions = useMemo<Option[]>(() => {
    return emptyOptionLabel != null
      ? [{ label: emptyOptionLabel, value: "" }, ...options]
      : options;
  }, [options, emptyOptionLabel]);

  // filtra por label (e value stringificado), case-insensitive
  const filtered = useMemo(() => {
    const q = normalizeStr(query.trim());
    if (!q) return baseOptions;

    return baseOptions.filter(o =>
      normalizeStr(o.label).includes(q) ||
      normalizeStr(String(o.value)).includes(q)
    );
  }, [baseOptions, query]);

  const selectedLabel =
    baseOptions.find(o => o.value === value)?.label ?? "";

  // clique fora fecha
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // quando abrir, foca o input e prepara highlight
  useEffect(() => {
    if (open) {
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const selectAt = (idx: number) => {
    const item = filtered[idx];
    if (!item) return;
    onChange(item.value);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectAt(highlight);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={`w-full ${className}`} ref={wrapRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          name={name}
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          onKeyDown={onKeyDown}
          className={`w-full text-left bg-white border border-gray-300 rounded-md px-3 py-2 pr-10
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
            {selectedLabel || "Selecione"}
          </span>
        </button>

        {/* botão limpar */}
        {allowClear && (value !== "" && value !== undefined) && !disabled && (
          <button
            type="button"
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            aria-label="Limpar seleção"
            title="Limpar"
          >
            ×
          </button>
        )}

        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          ▾
        </span>

        {open && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg"
            role="listbox"
          >
            <div className="p-2">
              <input
                ref={inputRef}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-56 overflow-auto py-1">
              {loading ? (
                <div className="px-3 py-1 text-sm text-orange-300 flex items-center">
                  <Spinner size={16} className="text-orange-500" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">Nenhuma opção</div>
              ) : (
                filtered.map((o, idx) => {
                  const active = idx === highlight;
                  const selected = o.value === value;
                  return (
                    <div
                      key={`${o.value}`}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setHighlight(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectAt(idx);
                      }}
                      className={`px-3 py-2 cursor-pointer text-sm
                        ${active ? "bg-blue-50" : ""}
                        ${selected ? "font-medium" : ""}`}
                    >
                      {o.label}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle
interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleInput({ label, value, onChange, disabled = false }: ToggleInputProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 select-none">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${value ? "bg-orange-500" : "bg-gray-300"}
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${value ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}


// GroupedSelect (Select com grupos)
type SubOption = { label: string; value: string | number };
type GroupedOption = { label: string; options: SubOption[] };

interface PropsGroupedSelect {
  label?: string;
  name?: string;
  groups: GroupedOption[];
  value: string | number | "";
  onChange: (v: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  allowClear?: boolean;
  emptyOptionLabel?: string;
}

export function GroupedSelect({
  label,
  name,
  groups,
  value,
  onChange,
  placeholder = "Pesquisar...",
  disabled,
  loading,
  className = "",
  allowClear = true,
  emptyOptionLabel,
}: PropsGroupedSelect) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // transforma grupos em lista "achatada", mas com marker de categoria
  const flatOptions = useMemo(() => {
    const opts: (SubOption & { isGroup?: boolean })[] = [];

    if (emptyOptionLabel != null) {
      opts.push({ label: emptyOptionLabel, value: "" });
    }

    groups.forEach((g) => {
      opts.push({ label: g.label, value: `__group-${g.label}`, isGroup: true });
      g.options.forEach((o) => opts.push(o));
    });

    return opts;
  }, [groups, emptyOptionLabel]);

  // filtra por label, mas mantém grupos
  const filtered = useMemo(() => {
    if (!query.trim()) return flatOptions;

    const q = query.toLowerCase();

    const opts: (SubOption & { isGroup?: boolean })[] = [];

    groups.forEach((g) => {
      const subsFiltradas = g.options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          String(o.value).toLowerCase().includes(q)
      );

      if (subsFiltradas.length > 0) {
        // só adiciona categoria se tiver pelo menos 1 subcategoria encontrada
        opts.push({ label: g.label, value: `__group-${g.label}`, isGroup: true });
        subsFiltradas.forEach((o) => opts.push(o));
      }
    });

    return opts;
  }, [groups, query]);

  const selectedLabel =
    flatOptions.find((o) => o.value === value)?.label ?? "";

  // clique fora
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectAt = (idx: number) => {
    const item = filtered[idx];
    if (!item || item.isGroup) return; // 🔥 não seleciona grupo
    onChange(item.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`w-full ${className}`} ref={wrapRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          name={name}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full text-left bg-white border border-gray-300 rounded-md px-3 py-2 pr-10
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
            {selectedLabel || "Selecione"}
          </span>
        </button>

        {allowClear && value !== "" && !disabled && (
          <button
            type="button"
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            ×
          </button>
        )}

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          ▾
        </span>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2">
              <input
                ref={inputRef}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-56 overflow-auto py-1">
              {loading ? (
                <div className="px-3 py-1 text-sm text-orange-300 flex items-center">
                  <Spinner size={16} className="text-orange-500" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">Nenhuma opção</div>
              ) : (
                filtered.map((o, idx) =>
                  o.isGroup ? (
                    <div
                      key={`g-${o.label}`}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-200 select-none cursor-not-allowed"
                    >
                      {o.label}
                    </div>
                  ) : (
                    <div
                      key={`${o.value}`}
                      role="option"
                      aria-selected={o.value === value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectAt(idx);
                      }}
                      className={`px-3 py-2 cursor-pointer text-xs hover:bg-blue-50
                        ${o.value === value ? "font-medium text-gray-700 bg-blue-50" : ""}`}
                    >
                      {o.label}
                    </div>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}