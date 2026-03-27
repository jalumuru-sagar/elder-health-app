"use client";

import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, HealthRecord } from "@/lib/api";
import { getToken, getUser, Role } from "@/lib/auth";

function tone(alert: HealthRecord["alert"]) {
  if (alert === "Critical") return "critical";
  if (alert === "Alert") return "alert";
  if (alert === "Warning") return "warning";
  return "normal";
}

export default function DashboardPage() {
  const router = useRouter();
  const [role] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return getUser()?.role ?? null;
  });
  const [patientIdInput, setPatientIdInput] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("ehm_patientId") ?? "";
  });
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("ehm_patientId") ?? "";
  });
  const [emergency, setEmergency] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (selectedPatientId.trim()) {
      window.localStorage.setItem("ehm_patientId", selectedPatientId.trim());
    }
  }, [selectedPatientId]);

  const patientQuery = useQuery({
    queryKey: ["patient", selectedPatientId],
    enabled: Boolean(selectedPatientId.trim()),
    queryFn: async () => {
      const { data } = await api.get<{ patientId: string; health: HealthRecord[] }>(
        `/api/patient/${selectedPatientId.trim()}`
      );
      return data;
    },
  });

  const alertsQuery = useQuery({
    queryKey: ["alerts", role, selectedPatientId],
    enabled: role === "care_manager" || Boolean(selectedPatientId.trim()),
    queryFn: async () => {
      const params =
        role === "care_manager" || !selectedPatientId.trim()
          ? undefined
          : { patientId: selectedPatientId.trim() };
      const { data } = await api.get<{ alerts: HealthRecord[] }>(`/api/alerts`, { params });
      return data.alerts;
    },
  });

  // Care manager form state
  const [heartRate, setHeartRate] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    patientId?: string;
    heartRate?: string;
    oxygen?: string;
    systolic?: string;
    diastolic?: string;
  }>({});

  const canSubmit = useMemo(() => {
    if (!selectedPatientId.trim()) return false;
    const n = (v: string) => v.trim().length > 0 && !Number.isNaN(Number(v));
    return n(heartRate) && n(oxygen) && n(systolic) && n(diastolic);
  }, [selectedPatientId, heartRate, oxygen, systolic, diastolic]);

  function validateForm() {
    const errors: {
      patientId?: string;
      heartRate?: string;
      oxygen?: string;
      systolic?: string;
      diastolic?: string;
    } = {};

    if (!selectedPatientId.trim()) errors.patientId = "Patient ID is required";

    const hr = Number(heartRate);
    const ox = Number(oxygen);
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (Number.isNaN(hr)) errors.heartRate = "Heart rate is required";
    else if (hr < 30 || hr > 200) errors.heartRate = "Heart rate out of valid range";

    if (Number.isNaN(ox)) errors.oxygen = "Oxygen is required";
    else if (ox < 50 || ox > 100) errors.oxygen = "Oxygen must be between 50-100";

    if (Number.isNaN(sys) || Number.isNaN(dia)) {
      errors.systolic = "Both blood pressure values are required";
      errors.diastolic = "Both blood pressure values are required";
    } else if (sys < 50 || sys > 250 || dia < 30 || dia > 150) {
      errors.systolic = "Invalid blood pressure values";
      errors.diastolic = "Invalid blood pressure values";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const createHealth = useMutation({
    mutationFn: async () => {
      const payload = {
        patientId: selectedPatientId.trim(),
        heartRate: Number(heartRate),
        oxygen: Number(oxygen),
        systolic: Number(systolic),
        diastolic: Number(diastolic),
      };
      const { data } = editingId
        ? await api.put<{ health: HealthRecord }>(`/api/health/${editingId}`, payload)
        : await api.post<{ health: HealthRecord }>(`/api/health`, payload);
      return data.health;
    },
    onSuccess: async () => {
      setSubmitError(null);
      setFieldErrors({});
      setHeartRate("");
      setOxygen("");
      setSystolic("");
      setDiastolic("");
      setEditingId(null);
      setSubmitSuccess(editingId ? "Data updated successfully" : "Data saved successfully");
      setTimeout(() => setSubmitSuccess(null), 2500);
      await patientQuery.refetch();
      await alertsQuery.refetch();
    },
    onError: (e: unknown) => {
      const err = e as AxiosError<{ message?: string }>;
      setSubmitSuccess(null);
      setSubmitError(err?.response?.data?.message || "Something went wrong");
    },
  });

  const patientAlerts = useMemo(() => {
    if (!alertsQuery.data) return [];
    return alertsQuery.data;
  }, [alertsQuery.data]);

  const patientErrorMessage = useMemo(() => {
    if (!patientQuery.isError) return null;
    return "No data available";
  }, [patientQuery.isError]);

  if (!role) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {(role === "parent" || role === "child") && (
          <Card title="Patient Lookup" subtitle="Enter Patient ID and click refresh.">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-zinc-900">Enter Patient ID</label>
                <Input value={patientIdInput} onChange={(e) => setPatientIdInput(e.target.value)} />
              </div>
              <Button
                variant="secondary"
                onClick={() => setSelectedPatientId(patientIdInput.trim())}
                disabled={!patientIdInput.trim()}
                className="sm:w-auto"
              >
                Refresh
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

            {role === "care_manager" && (
              <Card title="Add Data Form" subtitle="Submit a patient reading and generate alert classification.">
                {editingId && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Editing... Update values and click <span className="font-semibold">Update Data</span>.
                  </div>
                )}
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Patient ID</label>
                  <Input
                    value={selectedPatientId}
                    error={Boolean(fieldErrors.patientId)}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, patientId: undefined }));
                    }}
                  />
                  {fieldErrors.patientId && <p className="mt-1 text-xs text-red-600">{fieldErrors.patientId}</p>}
                </div>
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitError(null);
                    setSubmitSuccess(null);
                    if (!validateForm()) return;
                    if (canSubmit) createHealth.mutate();
                  }}
                >
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-900">Heart Rate</label>
                    <Input
                      value={heartRate}
                      error={Boolean(fieldErrors.heartRate)}
                      onChange={(e) => {
                        setHeartRate(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, heartRate: undefined }));
                      }}
                    />
                    {fieldErrors.heartRate && <p className="mt-1 text-xs text-red-600">{fieldErrors.heartRate}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-900">Oxygen</label>
                    <Input
                      value={oxygen}
                      error={Boolean(fieldErrors.oxygen)}
                      onChange={(e) => {
                        setOxygen(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, oxygen: undefined }));
                      }}
                    />
                    {fieldErrors.oxygen && <p className="mt-1 text-xs text-red-600">{fieldErrors.oxygen}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-900">Systolic</label>
                    <Input
                      value={systolic}
                      error={Boolean(fieldErrors.systolic)}
                      onChange={(e) => {
                        setSystolic(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, systolic: undefined }));
                      }}
                    />
                    {fieldErrors.systolic && <p className="mt-1 text-xs text-red-600">{fieldErrors.systolic}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-900">Diastolic</label>
                    <Input
                      value={diastolic}
                      error={Boolean(fieldErrors.diastolic)}
                      onChange={(e) => {
                        setDiastolic(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, diastolic: undefined }));
                      }}
                    />
                    {fieldErrors.diastolic && <p className="mt-1 text-xs text-red-600">{fieldErrors.diastolic}</p>}
                  </div>

                  {submitError && (
                    <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {submitSuccess}
                    </div>
                  )}

                  <div className="sm:col-span-2 flex items-center justify-end gap-3">
                    {editingId && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setHeartRate("");
                          setOxygen("");
                          setSystolic("");
                          setDiastolic("");
                          setEditingId(null);
                          setFieldErrors({});
                          setSubmitError(null);
                          setSubmitSuccess(null);
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                    {!editingId && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setHeartRate("");
                          setOxygen("");
                          setSystolic("");
                          setDiastolic("");
                          setFieldErrors({});
                          setSubmitError(null);
                          setSubmitSuccess(null);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                    <Button type="submit" loading={createHealth.isPending} disabled={!canSubmit}>
                      {editingId ? "Update Data" : "Save Data"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card title="Health History" subtitle="Health History (newest first)">
              {!selectedPatientId.trim() && role !== "care_manager" && (
                <p className="text-sm text-zinc-600">No data available</p>
              )}
              {patientQuery.isLoading && selectedPatientId.trim() && <p className="text-sm text-zinc-600">Loading...</p>}
              {patientErrorMessage && <p className="text-sm text-red-600">{patientErrorMessage}</p>}
              {patientQuery.data && (
                <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500">
                        <th className="py-2 pr-3 font-medium">Patient ID</th>
                        <th className="py-2 pr-3 font-medium">Heart Rate</th>
                        <th className="py-2 pr-3 font-medium">Oxygen</th>
                        <th className="py-2 pr-3 font-medium">BP</th>
                        <th className="py-2 pr-3 font-medium">Alert</th>
                        <th className="py-2 pr-3 font-medium">Time</th>
                        {role === "care_manager" && <th className="py-2 pr-3 font-medium">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {patientQuery.data.health.map((h) => (
                        <tr
                          key={h.id}
                          className={[
                            "hover:bg-zinc-50",
                            editingId === h.id ? "bg-amber-50/70 ring-1 ring-amber-200" : "",
                          ].join(" ")}
                        >
                          <td className="py-3 pr-3 text-zinc-700">{h.patientId}</td>
                          <td className="py-3 pr-3 text-zinc-700">{h.heartRate}</td>
                          <td className="py-3 pr-3 text-zinc-700">{h.oxygen}%</td>
                          <td className="py-3 pr-3 text-zinc-700">{h.systolic}/{h.diastolic}</td>
                          <td className="py-3 pr-3">
                            <Badge tone={tone(h.alert)}>{h.alert}</Badge>
                          </td>
                          <td className="py-3 pr-3 text-zinc-700">{new Date(h.createdAt).toLocaleString()}</td>
                          {role === "care_manager" && (
                            <td className="py-3 pr-3">
                              <Button
                                variant="secondary"
                                className="h-9 px-3 text-xs"
                                onClick={() => {
                                  setSelectedPatientId(h.patientId);
                                  setHeartRate(String(h.heartRate));
                                  setOxygen(String(h.oxygen));
                                  setSystolic(String(h.systolic));
                                  setDiastolic(String(h.diastolic));
                                  setEditingId(h.id);
                                  setSubmitError(null);
                                  setSubmitSuccess(null);
                                  setFieldErrors({});
                                }}
                              >
                                {editingId === h.id ? "Editing..." : "Edit"}
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {patientQuery.data.health.length === 0 && (
                        <tr>
                          <td className="py-6 text-sm text-zinc-600" colSpan={role === "care_manager" ? 7 : 6}>
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {role === "parent" && (
              <Card title="Emergency" subtitle="Quick UI trigger for urgent situations.">
                <Button
                  variant="danger"
                  className="w-full bg-red-600 transition-transform duration-150 hover:bg-red-500 hover:scale-[1.01] active:scale-[0.99]"
                  onClick={() => {
                    setEmergency(true);
                    setShowEmergencyModal(true);
                    setTimeout(() => setEmergency(false), 2500);
                  }}
                >
                  Emergency Alert
                </Button>
                {emergency && (
                  <div className="mt-3 animate-pulse rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Emergency alert triggered for patient {selectedPatientId.trim() || "Unknown"}
                  </div>
                )}
              </Card>
            )}

            <Card
              title="Recent Alerts"
              subtitle={
                role === "care_manager"
                  ? "Latest alert records from all patients."
                  : "Latest alert records for selected patient."
              }
            >
              {alertsQuery.isLoading && <p className="text-sm text-zinc-600">Loading...</p>}
              {!alertsQuery.isLoading && patientAlerts.length === 0 && (
                <p className="text-sm text-zinc-600">No alerts yet</p>
              )}
              {patientAlerts.length > 0 && (
                <div className="space-y-3">
                  {patientAlerts.slice(0, 10).map((h) => (
                    <div key={h.id} className="rounded-xl border border-zinc-200/70 bg-white p-4 shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone={tone(h.alert)}>{h.alert}</Badge>
                        <div className="text-xs text-zinc-500">{new Date(h.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-700">Patient ID: {h.patientId}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      {showEmergencyModal && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-zinc-900">Emergency Alert</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Emergency alert triggered for patient {selectedPatientId.trim() || "Unknown"}.
            </p>
            <div className="mt-5 flex justify-end">
              <Button variant="danger" onClick={() => setShowEmergencyModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

