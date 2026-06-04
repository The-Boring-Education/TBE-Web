import { useAuth } from '@tbe/auth';
import { LoadingSpinner, Section, SEO, Toast } from '@tbe/components';
import {
  COUNTRY_CODES,
  routes,
  USER_ROLE_OPTIONS,
  USER_USAGE_OPTIONS,
} from '@tbe/constants';
import { useUser, useUsername } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tbe/query';
import {
  getPreFetchProps,
  mergeApiAndSessionProfileForm,
  sendRequest,
  type UserProfileFormFields,
  type UserProfileFormSource,
} from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiLogOut, FiMail } from 'react-icons/fi';

/** Fields returned by GET /user that we show on this page (Mongoose user doc). */
interface ProfilePageApiUser extends UserProfileFormSource {
  name?: string;
  email?: string;
  image?: string;
}

const ProfilePage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();

  const [form, setForm] = useState<UserProfileFormFields>({
    userName: '',
    occupation: '',
    purpose: [],
    contactNo: '+91',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const { data: profileResponse, isLoading: loadingProfile } = useQuery({
    queryKey: queryKeys.user.profile(user?.id ?? '__no_user__'),
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User id required');
      }
      return sendRequest({
        url: `${routes.api.user}?userId=${encodeURIComponent(user.id)}`,
      });
    },
    ...CACHE_TIMES.STANDARD,
    enabled: Boolean(user?.id),
  });

  const profileRecord = profileResponse?.data as ProfilePageApiUser | undefined;

  const savedUserName = profileRecord?.userName ?? user?.userName ?? '';

  const displayName = profileRecord?.name ?? user?.name ?? 'User';
  const displayEmail = profileRecord?.email ?? user?.email ?? '';
  const displayImage = profileRecord?.image ?? user?.image;

  const resetFormFromSources = () => {
    if (!user?.id) return;
    setForm(mergeApiAndSessionProfileForm(profileRecord, user));
  };

  useEffect(() => {
    if (!user?.id || isEditing) return;
    setForm(mergeApiAndSessionProfileForm(profileRecord, user));
  }, [user, profileRecord, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (payload: UserProfileFormFields) => {
      const res = await sendRequest({
        url: `${routes.api.onboard}?userId=${encodeURIComponent(user!.id)}`,
        method: 'POST',
        body: payload,
      });
      if (!res.status) {
        throw new Error(
          typeof res.message === 'string' ? res.message : 'Update failed',
        );
      }
      return res;
    },
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.id),
        });
      }
      await updateSession();
    },
  });

  const { message: usernameMessage, isUsernameAvailable } = useUsername(
    isEditing ? form.userName : '',
  );

  const contactParts = useMemo(() => {
    const raw = form.contactNo.trim();
    const [first = '+91', ...rest] = raw.split(/\s+/);
    const number = rest.join(' ');
    return { code: first, number };
  }, [form.contactNo]);

  const { code, number } = contactParts;

  if (loadingUser)
    return <LoadingSpinner fullPage label='Loading profile...' />;
  if (!isAuth) {
    router.push(routes.login);
    return null;
  }

  if (loadingProfile)
    return <LoadingSpinner fullPage label='Loading profile...' />;

  const updateForm = <K extends keyof UserProfileFormFields>(
    key: K,
    value: UserProfileFormFields[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id || saveMutation.isPending) return;

    try {
      await saveMutation.mutateAsync({ ...form });
      setToast({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setIsEditing(false);
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const isFormValid = (): boolean => {
    if (!form.userName || form.userName.length < 3) return false;
    if (isEditing && form.userName !== savedUserName && !isUsernameAvailable)
      return false;
    if (!form.occupation) return false;
    if (!form.purpose.length) return false;
    return true;
  };

  const hasContactDigits = /\d/.test(form.contactNo);

  const occupationLabel =
    USER_ROLE_OPTIONS.find((o) => o.value === form.occupation)?.label ||
    form.occupation;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 bg-white sm:bg-slate-50 min-h-screen flex items-start justify-center'>
        <div className='w-full max-w-xl flex flex-col gap-6'>
          {/* Top Header Bar (Outside Card) */}
          <div className='flex items-start justify-between px-5 sm:px-0'>
            <div className='space-y-1 pr-4'>
              <h2 className='text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight'>
                Your <span className='text-[#FF5757]'>Profile</span>
              </h2>
              <p className='text-xs sm:text-sm text-slate-500 font-normal'>
                View and update your preference
              </p>
            </div>

            {/* Actions Button */}
            <div className='shrink-0'>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className='px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-md text-xs sm:text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]'
                >
                  Edit Profile
                </button>
              ) : (
                <div className='flex gap-2 shrink-0'>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      resetFormFromSources();
                    }}
                    className='px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md text-xs sm:text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]'
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!isFormValid() || saveMutation.isPending}
                    onClick={handleSave}
                    className='px-4 py-2 bg-[#FF5757] hover:bg-[#ff4444] text-white rounded-md text-xs sm:text-sm font-semibold transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-[#FF5757]/20'
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Card Container */}
          <div className='w-full bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-2xl p-5 sm:p-10 shadow-none sm:shadow-sm flex flex-col'>
            {/* Header section (Avatar + Info) */}
            <div className='flex items-center gap-5 sm:gap-8 mb-4'>
              <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0'>
                {displayImage ? (
                  <img
                    alt={displayName}
                    className='w-full h-full object-cover'
                    src={displayImage}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-500 text-3xl font-light bg-slate-100'>
                    {displayName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <h1 className='text-base sm:text-2xl font-bold text-slate-950 break-words leading-tight'>
                  {displayName}
                </h1>
                <p className='text-sm sm:text-base text-slate-500 font-normal mt-0.5 break-words'>
                  @{form.userName || 'username'}
                </p>
              </div>
            </div>

            {/* Details Section */}
            {isEditing ? (
              <div className='space-y-6 pt-4 border-t border-slate-100 text-base'>
                {/* Username */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-sm font-semibold text-slate-700'>
                    Username <span className='text-primary'>*</span>
                  </label>
                  <div className='relative flex items-center max-w-md'>
                    <span className='absolute left-3 text-slate-400 font-light text-base select-none'>
                      @
                    </span>
                    <input
                      type='text'
                      className='w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all duration-200'
                      value={form.userName}
                      onChange={(e) => updateForm('userName', e.target.value)}
                      placeholder='username'
                    />
                  </div>
                  {form.userName && form.userName !== savedUserName && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded self-start mt-0.5 ${
                        isUsernameAvailable
                          ? 'bg-green-50 text-[#31ad6b]'
                          : 'bg-red-50 text-[#FF5757]'
                      }`}
                    >
                      {usernameMessage}
                    </span>
                  )}
                </div>

                {/* Email Address (Read-only locked format) */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-sm font-semibold text-slate-400'>
                    Email Address{' '}
                    <span className='text-xs font-normal text-slate-400 font-mono'>
                      (locked)
                    </span>
                  </label>
                  <div className='relative flex items-center max-w-md opacity-60'>
                    <FiMail className='absolute left-3 text-slate-400 w-3.5 h-3.5' />
                    <input
                      type='email'
                      className='w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 text-base font-medium text-slate-500 bg-slate-100 cursor-not-allowed outline-none'
                      value={displayEmail}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-semibold text-slate-700'>
                    What do you do? <span className='text-primary'>*</span>
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {USER_ROLE_OPTIONS.map((opt) => {
                      const isSelected = form.occupation === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => updateForm('occupation', opt.value)}
                          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-[#FF5757] bg-red-50/20 text-[#FF5757] font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Purpose */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-semibold text-slate-700'>
                    How do you use the Platform?{' '}
                    <span className='text-primary'>*</span>
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {USER_USAGE_OPTIONS.map((opt) => {
                      const isSelected = form.purpose.includes(opt.value);
                      const handleToggle = () => {
                        if (isSelected) {
                          updateForm(
                            'purpose',
                            form.purpose.filter((val) => val !== opt.value),
                          );
                        } else {
                          updateForm('purpose', [...form.purpose, opt.value]);
                        }
                      };
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={handleToggle}
                          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-[#FF5757] bg-red-50/20 text-[#FF5757] font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <FiCheck className='w-3.5 h-3.5 stroke-[2.5]' />
                          )}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-sm font-semibold text-slate-700'>
                    Contact Number{' '}
                    <span className='text-xs font-normal text-slate-400 lowercase'>
                      (optional)
                    </span>
                  </label>
                  <div className='flex rounded-md border border-slate-300 overflow-hidden focus-within:border-[#FF5757] focus-within:ring-1 focus-within:ring-[#FF5757]/30 transition-all max-w-md bg-white'>
                    <select
                      value={code}
                      onChange={(e) =>
                        updateForm('contactNo', `${e.target.value} ${number}`)
                      }
                      className='bg-slate-50 border-0 border-r border-slate-200 focus:ring-0 focus:outline-none text-sm font-semibold text-slate-700 cursor-pointer py-2 pl-3 pr-8'
                      aria-label='Country Code'
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type='tel'
                      value={number}
                      onChange={(e) =>
                        updateForm('contactNo', `${code} ${e.target.value}`)
                      }
                      placeholder='Phone number'
                      className='w-full px-3 py-2 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-slate-800'
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-4 pt-4 border-t border-slate-100 text-base text-slate-700'>
                <div className='flex items-center'>
                  <span className='font-semibold text-slate-900 w-32 shrink-0'>
                    Username
                  </span>
                  <span className='text-slate-700 font-medium'>
                    @{form.userName || 'not_set'}
                  </span>
                </div>
                <div className='flex items-center'>
                  <span className='font-semibold text-slate-900 w-32 shrink-0'>
                    Email
                  </span>
                  <span className='text-slate-700'>
                    {displayEmail || 'not_set'}
                  </span>
                </div>
                <div className='flex items-center'>
                  <span className='font-semibold text-slate-900 w-32 shrink-0'>
                    Occupation
                  </span>
                  <span className='text-slate-700'>
                    {occupationLabel || 'Not set'}
                  </span>
                </div>
                <div className='flex items-start'>
                  <span className='font-semibold text-slate-900 w-32 shrink-0 mt-1'>
                    Platform Usage
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {form.purpose.length > 0 ? (
                      form.purpose.map((p) => {
                        const label =
                          USER_USAGE_OPTIONS.find((o) => o.value === p)
                            ?.label || p;
                        return (
                          <span
                            key={p}
                            className='px-3.5 py-1.5 rounded-full bg-red-50/20 text-[#FF5757] text-sm font-semibold border border-red-100/50'
                          >
                            {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className='text-slate-400'>Not set</span>
                    )}
                  </div>
                </div>
                <div className='flex items-center'>
                  <span className='font-semibold text-slate-900 w-32 shrink-0'>
                    Contact Number
                  </span>
                  <span className='text-slate-700'>
                    {hasContactDigits ? form.contactNo : 'Not set'}
                  </span>
                </div>
              </div>
            )}

            {/* Account Log Out footer */}
            <div className='pt-6 mt-8 border-t border-slate-100 flex justify-between items-center text-xs'>
              <span className='text-slate-400 font-medium'>
                Account status: Active
              </span>
              <button
                onClick={() => signOut(routes.home)}
                className='text-slate-400 hover:text-[#FF5757] font-semibold hover:underline flex items-center gap-1 transition-colors'
              >
                <FiLogOut className='w-3.5 h-3.5' />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </Section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.user.profile })),
});

export default ProfilePage;
