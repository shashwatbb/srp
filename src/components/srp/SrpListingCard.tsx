import type { SrpListing } from '../../data/srpMock'

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function Cube3DIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" />
      <path d="M12 22V12M4 6.5l8 4.5 8-4.5" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

type SrpListingCardProps = {
  listing: SrpListing
}

export function SrpListingCard({ listing }: SrpListingCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDDDDD] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex gap-1.5 p-1.5">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-[#EBEBEB]">
          <img
            src={listing.imageMain}
            alt=""
            className="aspect-[4/3] h-full w-full object-cover"
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
            {listing.verified ? (
              <span className="rounded-md bg-[#12A139] px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-white">
                Verified
              </span>
            ) : null}
            {listing.rera ? (
              <span className="rounded-md bg-[#12A139] px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-white">
                RERA
              </span>
            ) : null}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
            <span className="rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium leading-4 text-white backdrop-blur-[2px]">
              1/{listing.imageCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium leading-4 text-white backdrop-blur-[2px]">
              <Cube3DIcon className="text-white" />
              3D view
            </span>
          </div>
        </div>
        <div className="relative w-[30%] shrink-0 overflow-hidden rounded-xl bg-[#EBEBEB]">
          <img
            src={listing.imageSecondary}
            alt=""
            className="aspect-[3/4] h-full w-full object-cover"
            width={240}
            height={320}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-[2px] active:bg-black/50"
            aria-label="Save"
          >
            <HeartIcon />
          </button>
          <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-[2px]">
            {listing.timeAgo}
          </span>
        </div>
      </div>

      <div className="px-3 pb-3 pt-1">
        <p className="text-xs font-normal leading-4 text-[#6A6A6A]">
          {listing.statusLine}
        </p>
        <h2 className="mt-1.5 text-base font-semibold leading-5 text-[#222222]">
          {listing.configuration}
        </h2>
        <p className="mt-1 text-lg font-semibold leading-6 tracking-tight text-[#222222]">
          {listing.price}
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-[#222222]">
          {listing.projectName}
        </p>
        <p className="mt-1 text-xs font-normal leading-4 text-[#6A6A6A]">
          {listing.locationLine}
        </p>

        <div className="my-3 h-px bg-[#EBEBEB]" />

        <div className="flex items-start gap-2">
          <img
            src={listing.owner.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="mt-0.5 h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#EBEBEB]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-[#222222]">
              {listing.owner.name}
            </p>
            <p className="text-xs font-normal leading-4 text-[#6A6A6A]">
              {listing.owner.role}
            </p>
          </div>
          <div className="flex max-w-[58%] shrink-0 flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              className="whitespace-nowrap rounded-lg bg-[#F3ECFF] px-2.5 py-2 text-[11px] font-semibold leading-4 text-[#5B22DE] active:bg-[#E8DCFF]"
            >
              View Number
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366] active:opacity-90"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B22DE] active:bg-[#4C1BB8]"
              aria-label="Call"
            >
              <PhoneIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
